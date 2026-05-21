const { NestFactory } = require('@nestjs/core');
const { Module, Injectable, Inject } = require('@nestjs/common');

@Injectable()
class TestService {
  constructor() { this.name = 'TestService'; }
}

@Injectable() 
class ConsumerService {
  constructor(svc) { this.svc = svc; }
}

@Module({
  providers: [TestService, ConsumerService]
})
class TestModule {}

async function main() {
  try {
    const app = await NestFactory.createApplicationContext(TestModule);
    const consumer = app.get(ConsumerService);
    console.log('Consumer resolved:', consumer.svc?.name);
    await app.close();
  } catch(e) {
    console.log('Error:', e.message?.substring(0, 200));
  }
}
main();
