import dotenv from 'dotenv';
import path from 'path';

export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  
  private constructor() {
    this.loadEnvironment();
  }
  
  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }
  
  private loadEnvironment(): void {
    const env = process.env.NODE_ENV || 'development';
    const envFile = `.env.${env}`;
    
    dotenv.config({ path: path.resolve(process.cwd(), envFile) });
  }
  
  public get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }
  
  public get port(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  public get apiVersion(): number {
    return parseInt(process.env.VERSION || 'b0.1');
  }
  
  public get databaseUrl(): string {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    return process.env.DATABASE_URL;
  }
  
  public get clientUrl(): string {
    return process.env.CLIENT_URL || 'http://localhost:5173' || 'http://localhost:4173';
  }
  
  public get corsOrigin(): string {
    return process.env.CORS_ORIGIN || 'http://localhost:5173' || 'http://localhost:4173';
  }
  
  public get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
  
  public get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}

export const envConfig = EnvironmentConfig.getInstance();