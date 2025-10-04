import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Test User',
          email: `test-${Date.now()}@example.com`,
        })
        .expect(201)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test User');
        });
    });

    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 for missing name', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/api/users (GET)', () => {
    it('should return paginated users list', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should respect pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/users?page=1&limit=5')
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });
  });

  describe('/api/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });
});
