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
  db: DBConfig;
  grpc: {
    authServerUrl: string;
    resourceServerUrl: string;
  };
  apis: {
    apiKey: string;
    apiUrl: string;
  };
}

export const appConfig: Config = {
  port: parseInt(process.env.RESOURCE_SERVER_PORT || '3001', 10),
  db: {
    host: process.env.RESOURCE_DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.RESOURCE_DB_DATABASE || 'mydatabase',
  },
  grpc: {
    authServerUrl: process.env.GRPC_AUTH_SERVER_URL || 'localhost:5000',
    resourceServerUrl: process.env.GRPC_RESOURCE_SERVER_URL || 'localhost:5001',
  },
  apis: {
    apiKey: process.env.API_KEY || '',
    apiUrl: process.env.BASEURL || '',
  },
};
