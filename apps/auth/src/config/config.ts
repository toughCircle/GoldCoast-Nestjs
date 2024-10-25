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
    resourceServerUrl: string;
  };
}

export const appConfig: Config = {
  port: parseInt(process.env.AUTH_SERVER_PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  db: {
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.AUTH_DB_DATABASE || 'mydatabase',
  },
  grpc: {
    authServerUrl: process.env.GRPC_AUTH_SERVER_URL || 'localhost:5000',
    resourceServerUrl: process.env.GRPC_RESOURCE_SERVER_URL || 'localhost:5001',
  },
};
