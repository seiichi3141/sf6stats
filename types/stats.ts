export interface UsageCharacterStat {
  character_tool_name: string;
  character_alpha: string;
  play_rate: number;
  count: number;
  play_cnt: number;
  total_cnt: number;
  previous_rate: number;
}

export interface UsageLeagueBucket {
  league_rank: number;
  league_alpha: string;
  val: UsageCharacterStat[];
}

export interface UsageOperation {
  operation_type?: number;
  val: UsageLeagueBucket[];
}

export interface UsageRateResponse {
  usagerateData: UsageOperation[];
}

export interface DiaOpponentHeader {
  id: number;
  name_alpha: string;
  tool_name: string;
  input_type?: string;
  _dsort: number;
}

export interface DiaValue {
  _oid: number;
  _dsort: number;
  sf: number;
  thm: number;
  val: string;
}

export interface DiaRecord {
  id: number;
  name_alpha: string;
  tool_name: string;
  input_type?: string;
  total: string;
  _win_rate: number;
  values: DiaValue[];
}

export interface DiaEntry {
  opponent_header: DiaOpponentHeader[];
  records: DiaRecord[];
}

export interface DiaResponse {
  diaData: {
    ci?: {
      ci_sort: Record<string, DiaEntry>;
    };
    c?: {
      ci_sort: Record<string, DiaEntry>;
    };
  };
}
