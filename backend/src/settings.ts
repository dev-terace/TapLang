import * as dotenv from 'dotenv';
dotenv.config();


function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다. .env 파일을 확인하세요.`);
  }
  return value;
}

interface Settings {
  db: {
    postgresUrl: string;
    mongoUrl: string;
  };
  app: {
    port: number;
    env: string;
  };
}

const settings: Settings = {
  db: {
    postgresUrl: requireEnv("POSTGRES_DATABASE_URL"),
    mongoUrl: requireEnv("MONGODB_DATABASE_URL"),
  },
  app: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
};

export default settings;