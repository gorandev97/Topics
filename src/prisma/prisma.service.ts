import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Make Prisma Client accessible in the whole app
@Injectable()
export class PrismaService extends PrismaClient {}
