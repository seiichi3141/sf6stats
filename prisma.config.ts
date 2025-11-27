import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    db: {
      url: 'file:./prisma/dev.db',
    },
  },
});
