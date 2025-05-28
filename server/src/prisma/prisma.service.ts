import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService) {
    // super will call constructor of PrismaClient (extend class)
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Successfully connected to PostgreSQL');
    } catch (error) {
      console.error('❌ Error connecting to PostgreSQL:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
