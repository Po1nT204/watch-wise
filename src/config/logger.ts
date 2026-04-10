import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // В продакшене Pino пишет чистый JSON.
  // В разработке используем pino-pretty для читаемости.
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard', // Понятный формат времени
        ignore: 'pid,hostname', // Убираем лишний мусор из консоли
      },
    },
  }),
});
