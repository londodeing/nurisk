require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { Module, Injectable } = require('@nestjs/common');

class BaseClass {
  constructor(opts) { this.opts = opts; }
}

@Injectable()
class ExtService extends BaseClass {
  constructor() { super('test'); this.name = 'ExtService'; }
}

@Injectable() 
class ConsumerService {
  constructor(svc) { this.svc = svc; }
}

@Module({ providers: [ExtService, ConsumerService] })
class TestModule {}

async function main() {
  try {
    const app = await NestFactory.createApplicationContext(TestModule);
    const consumer = app.get(ConsumerService);
    console.log('Success! Consumer.svc.name:', consumer.svc?.name || consumer.svc?.constructor?.name);
    await app.close();
  } catch(e) {
    console.log('Error:', e.message.substring(0, 500));
  }
  process.exit(0);
}
main();
