/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

function randEmail(prefix: string) {
  const rnd = Math.floor(Math.random() * 1e9);
  return `${prefix}.${rnd}@example.com`;
}

describe('Investments E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers users, creates project, invests, and lists investments', async () => {
    const farmerEmail = randEmail('farmer');
    const investorEmail = randEmail('investor');

    // register farmer
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Farmer One', email: farmerEmail, password: 'password123' })
      .expect(201);

    // login farmer
    const farmerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: farmerEmail, password: 'password123' })
      .expect(201);
    const farmerToken = farmerLogin.body.access_token;

    // create project
    const projRes = await request(app.getHttpServer())
      .post('/investments/projects')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        title: 'Greenhouse Tomatoes',
        description: 'Modern greenhouse in Sfax',
        category: 'Greenhouse',
        location: 'Sfax',
        targetAmount: 10000,
        minimumInvestment: 500,
        expectedROI: 12,
        duration: 12,
      })
      .expect(201);
    const projectId = projRes.body.id;

    // register investor
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Investor One', email: investorEmail, password: 'password123' })
      .expect(201);

    // login investor
    const investorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: investorEmail, password: 'password123' })
      .expect(201);
    const investorToken = investorLogin.body.access_token;

    // invest
    const investRes = await request(app.getHttpServer())
      .post('/investments/invest')
      .set('Authorization', `Bearer ${investorToken}`)
      .send({ projectId, amount: 1000 });
    if (investRes.status !== 201) {
      // Helpful debug output if failing
      // eslint-disable-next-line no-console
      console.log('Invest response', investRes.status, investRes.body);
    }
    expect(investRes.status).toBe(201);
    expect(investRes.body.id).toBeDefined();

    // list my investments
    const mineRes = await request(app.getHttpServer())
      .get('/investments/my-investments')
      .set('Authorization', `Bearer ${investorToken}`)
      .expect(200);
    expect(Array.isArray(mineRes.body)).toBe(true);
    expect(mineRes.body.length).toBeGreaterThanOrEqual(1);
    const found = mineRes.body.find((i: any) => i.project?.id === projectId);
    expect(found).toBeTruthy();
  });
});
