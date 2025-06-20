// src/seed/seed.module.ts
import { Module } from '@nestjs/common'
import { SeedController } from './seed.controller'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [SeedController],
  providers: [PrismaService],
})
export class SeedModule {}
