import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const prismaClientSingleton = () => {
  // Создаем пул соединений
  const pool = new Pool({ connectionString });
  // Создаем адаптер Prisma для Postgres
  const adapter = new PrismaPg(pool);

  // Возвращаем клиент с подключенным адаптером
  return new PrismaClient({ adapter });
};

// 2. Получаем тип возвращаемого значения этой функции
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// 3. Сохраняем в глобальной области видимости (чтобы не терять коннект при релоаде)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// 4. Если экземпляр уже есть — берем его, иначе создаем новый
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
