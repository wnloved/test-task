import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // Import the adapter
import { Pool } from 'pg'; // Import the database driver pool

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Create a connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log(process.env.DATABASE_URL)
    // Pass the adapter to PrismaClient
    super({
      adapter: new PrismaPg(pool),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}