import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('Database Connected Successfully');
});

export default pool;

@Injectable()
export class DatabaseService {
  getPool(): Pool {
    return pool;
  }
}