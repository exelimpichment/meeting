type RawCapablePrisma = {
  $queryRawUnsafe<T>(query: string): Promise<T>;
  $executeRawUnsafe(query: string): Promise<unknown>;
};

export async function cleanDatabase(prisma: RawCapablePrisma) {
  const tableRecords = await prisma.$queryRawUnsafe<
    Array<{ TABLE_NAME: string }>
  >(
    'SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = database();',
  );

  const tableNames = tableRecords
    .map((record) => record.TABLE_NAME)
    .filter((tableName) => tableName !== '_prisma_migrations');

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0;');
  for (const tableName of tableNames) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tableName}\`;`);
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1;');
}
