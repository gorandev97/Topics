import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Import the Prisma service

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Make the PrismaService available to other modules
})
export class PrismaModule {}
