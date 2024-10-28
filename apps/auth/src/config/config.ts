import { config as dotenvConfig } from 'dotenv';
dotenvConfig(); // .env 파일 로드

interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

interface Config {
  port: number;
  jwtSecret: string;
  db: DBConfig;
  grpc: {
    authServerUrl: string;
  };
}

export const appConfig: Config = {
  port: parseInt(process.env.AUTH_SERVER_PORT, 10),
  jwtSecret: process.env.JWT_SECRET,
  db: {
    host: process.env.AUTH_DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.AUTH_DB_DATABASE,
  },
  grpc: {
    authServerUrl: process.env.GRPC_AUTH_SERVER_URL,
  },
};
