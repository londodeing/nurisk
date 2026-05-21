import 'reflect-metadata';
import { PrismaService } from './src/prisma/prisma.service';

const params = Reflect.getMetadata('design:paramtypes', PrismaService);
console.log('PrismaService design:paramtypes:', params?.map((p: any) => p?.name || p?.toString()));

const ownParams = Reflect.getOwnMetadata('design:paramtypes', PrismaService);
console.log('PrismaService own design:paramtypes:', ownParams?.map((p: any) => p?.name || p?.toString()));

// Also check if PrismaClient has constructor params
import { PrismaClient } from '@prisma/client';
const clientParams = Reflect.getMetadata('design:paramtypes', PrismaClient);
console.log('PrismaClient design:paramtypes:', clientParams?.map((p: any) => p?.name || p?.toString()));
