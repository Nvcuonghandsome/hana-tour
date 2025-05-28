import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TourModule } from './tour/tour.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // can use config env global
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    TourModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
