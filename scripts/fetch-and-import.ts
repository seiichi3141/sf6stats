import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { setTimeout as delay } from 'timers/promises';

/**
 * 対象期間: 2023-06 〜 2025-10
 * エンドポイント:
 * - 使用率: /stats/usagerate/{YYYYMM}, /stats/usagerate_master/{YYYYMM}
 * - ダイヤ: /stats/dia/{YYYYMM}, /stats/dia_master/{YYYYMM}
 */

const prisma = new PrismaClient();

const BASE = 'https://www.streetfighter.com/6/buckler/api/ja-jp/stats';
const START = { year: 2023, month: 6 };
const END = { year: 2025, month: 10 };
const RAW_DIR = path.join(process.cwd(), 'data', 'raw');

type UsageApi = {
  usagerateData: {
    operation_type?: number;
    val: {
      league_rank: number;
      league_alpha: string;
      val: {
        character_tool_name: string;
        character_alpha: string;
        play_rate: number;
        count: number;
        play_cnt: number;
        total_cnt: number;
        previous_rate: number;
      }[];
    }[];
  }[];
};

type DiaApi = {
  diaData: {
    ci?: { ci_sort: Record<string, DiaEntry> };
    c?: { ci_sort: Record<string, DiaEntry> };
  };
};

type DiaEntry = {
  opponent_header: {
    id: number;
    name_alpha: string;
    tool_name: string;
    input_type?: string;
    _dsort: number;
  }[];
  records: {
    id: number;
    name_alpha: string;
    tool_name: string;
    input_type?: string;
    total: string;
    _win_rate: number;
    values: {
      _oid: number;
      _dsort: number;
      sf: number;
      thm: number;
      val: string;
    }[];
  }[];
};

const monthsInRange = () => {
  const res: string[] = [];
  let y = START.year;
  let m = START.month;
  while (y < END.year || (y === END.year && m <= END.month)) {
    res.push(`${y}${String(m).padStart(2, '0')}`);
    m += 1;
    if (m === 13) {
      m = 1;
      y += 1;
    }
  }
  return res;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (sf6stats-import)',
      Accept: 'application/json',
      Referer: 'https://www.streetfighter.com/6/buckler/',
      'Accept-Language': 'ja,en;q=0.9',
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${url}`);
  }
  return res.json() as Promise<T>;
};

const ensureSeason = async (id: number) => {
  await prisma.season.upsert({
    where: { id },
    update: {},
    create: { id },
  });
};

const ensureLeague = async (id: number, alpha: string) => {
  await prisma.league.upsert({
    where: { id },
    update: { alpha },
    create: { id, alpha },
  });
};

const ensureCharacter = async ({
  toolName,
  nameAlpha,
  externalId,
}: {
  toolName: string;
  nameAlpha: string;
  externalId?: number;
}) => {
  const existing = await prisma.character.findUnique({ where: { toolName } });
  if (existing) {
    if (existing.nameAlpha !== nameAlpha || (externalId && !existing.externalId)) {
      await prisma.character.update({
        where: { toolName },
        data: { nameAlpha, externalId: externalId ?? existing.externalId },
      });
    }
    return existing.id;
  }
  const created = await prisma.character.create({
    data: { toolName, nameAlpha, externalId },
  });
  return created.id;
};

const importUsage = async (month: string, master: boolean) => {
  const url = `${BASE}/${master ? 'usagerate_master' : 'usagerate'}/${month}`;
  const json = await fetchJson<UsageApi>(url);
  // ローカルに生データを保存
  const dir = path.join(RAW_DIR, month);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, master ? 'usagerate_master.json' : 'usagerate.json'),
    JSON.stringify(json, null, 2)
  );

  const seasonId = Number(month);
  await ensureSeason(seasonId);

  for (const op of json.usagerateData) {
    const opType = op.operation_type ?? null;
    for (const league of op.val) {
      await ensureLeague(league.league_rank, league.league_alpha);
      for (const c of league.val) {
        const charId = await ensureCharacter({
          toolName: c.character_tool_name,
          nameAlpha: c.character_alpha,
        });
        await prisma.usageStat.upsert({
          where: {
            seasonId_leagueId_characterId_operationType: {
              seasonId,
              leagueId: league.league_rank,
              characterId: charId,
              operationType: opType ?? 0,
            },
          },
          update: {
            playRate: c.play_rate,
            previousRate: c.previous_rate,
            count: c.count,
            playCnt: c.play_cnt,
            totalCnt: c.total_cnt,
          },
          create: {
            seasonId,
            leagueId: league.league_rank,
            characterId: charId,
            operationType: opType ?? 0,
            playRate: c.play_rate,
            previousRate: c.previous_rate,
            count: c.count,
            playCnt: c.play_cnt,
            totalCnt: c.total_cnt,
          },
        });
      }
    }
  }
  console.log(`Imported usage ${month} ${master ? 'master' : 'all'}`);
};

const importDia = async (month: string, master: boolean) => {
  const url = `${BASE}/${master ? 'dia_master' : 'dia'}/${month}`;
  const json = await fetchJson<DiaApi>(url);
  const dir = path.join(RAW_DIR, month);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, master ? 'dia_master.json' : 'dia.json'),
    JSON.stringify(json, null, 2)
  );

  const seasonId = Number(month);
  const ciSort = master ? json.diaData.c?.ci_sort : json.diaData.ci?.ci_sort;
  if (!ciSort) {
    console.warn(`No dia data for ${month} master=${master}`);
    return;
  }
  for (const [leagueKey, entry] of Object.entries(ciSort)) {
    const leagueId = Number(leagueKey);
    await ensureLeague(leagueId, leagueId === 36 ? 'MASTER' : leagueId.toString());
    await ensureSeason(seasonId);

    // opponent headerからキャラを登録
    const opponentIdMap = new Map<number, number>();
    for (const opp of entry.opponent_header) {
      const id = await ensureCharacter({
        toolName: opp.tool_name,
        nameAlpha: opp.name_alpha,
        externalId: opp.id,
      });
      opponentIdMap.set(opp.id, id);
    }

    for (const rec of entry.records) {
      const charId = await ensureCharacter({
        toolName: rec.tool_name,
        nameAlpha: rec.name_alpha,
        externalId: rec.id,
      });
      const winRate = rec._win_rate;

      for (const v of rec.values) {
        const oppId = opponentIdMap.get(v._oid);
        if (!oppId) continue;
        await prisma.matchup.upsert({
          where: {
            seasonId_leagueId_characterId_opponentId: {
              seasonId,
              leagueId,
              characterId: charId,
              opponentId: oppId,
            },
          },
          update: {
            dsort: v._dsort,
            val: v.val,
            winRate,
            sf: v.sf,
            thm: v.thm,
          },
          create: {
            seasonId,
            leagueId,
            characterId: charId,
            opponentId: oppId,
            dsort: v._dsort,
            val: v.val,
            winRate,
            sf: v.sf,
            thm: v.thm,
          },
        });
      }
    }
  }
  console.log(`Imported dia ${month} ${master ? 'master' : 'all'}`);
};

const main = async () => {
  // SQLite ファイルが存在しない場合に備え、ディレクトリを作成
  const dbDir = path.join(process.cwd(), 'prisma');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);

  const months = monthsInRange();
  for (const m of months) {
    await importUsage(m, false);
    await delay(300);
    await importUsage(m, true);
    await delay(300);
    await importDia(m, false);
    await delay(300);
    await importDia(m, true);
    await delay(300);
  }
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
