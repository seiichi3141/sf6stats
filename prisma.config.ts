import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasources: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});
