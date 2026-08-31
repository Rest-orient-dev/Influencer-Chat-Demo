import dns from "node:dns";
import mysql, { type ExecuteValues } from "mysql2/promise";

dns.setDefaultResultOrder("ipv4first");

let pool: mysql.Pool | null = null;

function getEnv(name: string) {
  return process.env[name];
}

export function getDbPool(): mysql.Pool {
  if (pool) return pool;

  const host = getEnv("DB_HOST");
  const user = getEnv("DB_USER");
  const password = getEnv("DB_PASSWORD");
  const database = getEnv("DB_NAME");

  if (!host || !user || !password || !database) {
    throw new Error(
      "DB 未配置：需要 DB_HOST/DB_USER/DB_PASSWORD/DB_NAME（Hostinger MySQL）。",
    );
  }

  const port = Number(getEnv("DB_PORT") || 3306);
  const sslFlag = (getEnv("DB_SSL") || "").toLowerCase();
  const hostLooksRemote = /hstgr\.io|hostinger/i.test(host);
  const useSsl = sslFlag === "true" || (sslFlag !== "false" && hostLooksRemote);

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
    enableKeepAlive: true,
    connectTimeout: 15000,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  return pool;
}

export async function dbQuery<T = unknown>(
  sql: string,
  params: ExecuteValues = [] as unknown as ExecuteValues,
): Promise<T[]> {
  const p = getDbPool();
  const [rows] = await p.execute(sql, params);
  return rows as T[];
}
