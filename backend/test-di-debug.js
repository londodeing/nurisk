var path = require('path');
process.env.DOTENV_CONFIG_PATH = path.resolve('.env');
require('dotenv/config');
require('reflect-metadata');

var IncidentRepository = require('./src/incident/incident.repository').IncidentRepository;
var PrismaService = require('./src/prisma/prisma.service').PrismaService;

console.log('=== DESIGN:PARAMTYPES CHECK ===');
var params = Reflect.getMetadata('design:paramtypes', IncidentRepository);
console.log('Retrieved:', params ? 'yes' : 'no');
console.log('Length:', params ? params.length : 0);
console.log('Param[0]:', params && params[0] ? params[0].name : 'undefined');
console.log('Param[0] === PrismaService:', params && params[0] === PrismaService);

// Check module metadata
var incidentModule = require('./src/incident/incident.module').IncidentModule;
console.log('\n=== MODULE METADATA ===');
var providers = Reflect.getMetadata('providers', incidentModule);
console.log('Providers:', providers ? providers.map(function(p) { return typeof p === 'function' ? p.name : (p.provide || 'unknown'); }) : 'none');
console.log('Imports:', Reflect.getMetadata('imports', incidentModule));

// Check if PrismaService has @Injectable
console.log('\n=== PRISMASERVICE CHECK ===');
var isInjectable = Reflect.getMetadata('__injectable__', PrismaService) || Reflect.getOwnMetadata('__injectable__', PrismaService);
console.log('Injectable metadata:', isInjectable);
var selfParam = Reflect.getMetadata('design:paramtypes', PrismaService);
console.log('PrismaService self param:', selfParam);
