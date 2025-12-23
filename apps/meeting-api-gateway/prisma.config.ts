import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'src/iam/prisma/schema.prisma',

  datasource: {
    url: env('DIRECT_URL'),
  },
});
