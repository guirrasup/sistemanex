// backend/src/lib/logger.ts
// Logger central (winston). Em produção grava JSON estruturado (uma linha por
// evento, fácil de coletar no Docker/Loki/CloudWatch); em desenvolvimento usa
// saída colorida legível. Aceita os mesmos argumentos que console.* — os
// argumentos extras (ex.: objetos de erro) são formatados com util.format,
// preservando o stack trace.
import { format as formatarArgs } from 'node:util';
import winston from 'winston';

// Criado no primeiro uso (e não no import) para respeitar NODE_ENV/LOG_LEVEL
// carregados pelo dotenv no server.ts, já que imports ESM rodam antes dele.
let winstonLogger: winston.Logger | null = null;

function obterLogger(): winston.Logger {
  if (winstonLogger) return winstonLogger;

  const isProducao = process.env.NODE_ENV === 'production';
  winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isProducao ? 'info' : 'debug'),
    format: isProducao
      ? winston.format.combine(winston.format.timestamp(), winston.format.json())
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level} ${message}`)
        ),
    transports: [new winston.transports.Console()],
  });
  return winstonLogger;
}

type NivelLog = 'error' | 'warn' | 'info' | 'debug';

function registrar(nivel: NivelLog, args: unknown[]): void {
  obterLogger().log(nivel, formatarArgs(...args));
}

export const logger = {
  error: (...args: unknown[]) => registrar('error', args),
  warn: (...args: unknown[]) => registrar('warn', args),
  info: (...args: unknown[]) => registrar('info', args),
  debug: (...args: unknown[]) => registrar('debug', args),
};
