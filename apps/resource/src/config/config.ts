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
  };
  apis: {
    apiKey: string;
    apiUrl: string;
  };
}

export const appConfig: Config = {
  port: parseInt(process.env.RESOURCE_SERVER_PORT, 10),
  db: {
    host: process.env.RESOURCE_DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.RESOURCE_DB_DATABASE,
  },
  grpc: {
    authServerUrl: process.env.GRPC_AUTH_SERVER_URL,
  },
  apis: {
    apiKey: process.env.API_KEY || '',
    apiUrl: process.env.BASEURL || '',
  },
};
