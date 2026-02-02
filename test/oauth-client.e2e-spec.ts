import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('OAuth Client (e2e)', () => {
  let app: INestApplication;
  let createdClientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /oauth-clients (Create)', () => {
    it('should create a new OAuth client', () => {
      return request(app.getHttpServer())
        .post('/oauth-clients')
        .send({
          name: 'Test Application',
          redirectUri: 'http://localhost:3000/callback',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('clientId');
          expect(res.body).toHaveProperty('clientSecret');
          expect(res.body.status).toBe('ACTIVE');
          createdClientId = res.body.clientId;
        });
    });

    it('should reject invalid input', () => {
      return request(app.getHttpServer())
        .post('/oauth-clients')
        .send({ name: 'Test' })
        .expect(400);
    });
  });

  describe('GET /oauth-clients (List)', () => {
    it('should return all OAuth clients', () => {
      return request(app.getHttpServer())
        .get('/oauth-clients')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /oauth-clients/:id (Get One)', () => {
    it('should return a specific OAuth client', () => {
      return request(app.getHttpServer())
        .get(`/oauth-clients`)
        .then((res) => {
          const clientId = res.body[0].id;
          return request(app.getHttpServer())
            .get(`/oauth-clients/${clientId}`)
            .expect(200)
            .expect((res) => {
              expect(res.body).toHaveProperty('id');
              expect(res.body).toHaveProperty('name');
              expect(res.body).not.toHaveProperty('clientSecret');
            });
        });
    });

    it('should return 404 for non-existent client', () => {
      return request(app.getHttpServer())
        .get('/oauth-clients/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /oauth-clients/:id (Update)', () => {
    it('should update an OAuth client', () => {
      return request(app.getHttpServer())
        .get(`/oauth-clients`)
        .then((res) => {
          const clientId = res.body[0].id;
          return request(app.getHttpServer())
            .patch(`/oauth-clients/${clientId}`)
            .send({
              name: 'Updated Application',
              redirectUri: 'http://localhost:3001/callback',
            })
            .expect(200)
            .expect((res) => {
              expect(res.body.name).toBe('Updated Application');
              expect(res.body.redirectUri).toBe(
                'http://localhost:3001/callback',
              );
            });
        });
    });
  });

  describe('PATCH /oauth-clients/:id/status (Update Status)', () => {
    it('should update client status', () => {
      return request(app.getHttpServer())
        .get(`/oauth-clients`)
        .then((res) => {
          const clientId = res.body[0].id;
          return request(app.getHttpServer())
            .patch(`/oauth-clients/${clientId}/status`)
            .send({ status: 'DISABLED' })
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe('DISABLED');
            });
        });
    });

    it('should reactivate a disabled client', () => {
      return request(app.getHttpServer())
        .get(`/oauth-clients`)
        .then((res) => {
          const clientId = res.body[0].id;
          return request(app.getHttpServer())
            .patch(`/oauth-clients/${clientId}/status`)
            .send({ status: 'ACTIVE' })
            .expect(200)
            .expect((res) => {
              expect(res.body.status).toBe('ACTIVE');
            });
        });
    });
  });

  describe('DELETE /oauth-clients/:id (Delete)', () => {
    it('should delete an OAuth client', () => {
      return request(app.getHttpServer())
        .get(`/oauth-clients`)
        .then((res) => {
          const clientToDelete = res.body[res.body.length - 1];
          return request(app.getHttpServer())
            .delete(`/oauth-clients/${clientToDelete.id}`)
            .expect(204);
        });
    });
  });
});
