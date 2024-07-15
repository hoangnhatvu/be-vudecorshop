import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import { join } from 'path';

const envFilePath = join(__dirname, '..', '.env');
export const otpCache: Record<string, { otp: string; expirationTime: number }> = {};
export const verify: Record<string, {isVerified: boolean}> = {};


config({ path: envFilePath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
