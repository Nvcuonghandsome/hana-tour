import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // make prisma service global
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
