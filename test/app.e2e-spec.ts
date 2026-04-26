import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    } catch (e) {
      console.error('FAILED TO INITIALIZE APP', e);
      throw e;
    }
  });

  it('/ (GET) - Should return 404 with global exception format', () => {
    return request(app.getHttpServer())
      .get('/non-existent-route')
      .expect(404)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(404);
        expect(res.body.message).toBeDefined();
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.path).toBeDefined();
      });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
