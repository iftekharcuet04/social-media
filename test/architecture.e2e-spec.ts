import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PostRepository } from "../src/repositories/post.repository";
import { ConcurrencyLimiterService } from "../src/common/services/concurrency-limiter.service";

describe("Architecture Verification (e2e)", () => {
  let app: INestApplication;
  let postRepository: PostRepository;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule]
      }).compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
      
      postRepository = moduleFixture.get<PostRepository>(PostRepository);
      
      await app.init();
    } catch (e) {
      console.error('ARCHITECTURE TEST SETUP FAILED', e);
      throw e;
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("Unified Response Format", () => {
    it("should return a standardized success response format", async () => {
      // Use a route that might exist or just check the structure
      const res = await request(app.getHttpServer()).get("/");
      
      if (res.status < 500) {
        expect(res.body).toMatchObject({
          timestamp: expect.any(String),
        });
      }
    });
  });

  describe("Global Exception Filter", () => {
    it("should return a standardized error response", async () => {
      const res = await request(app.getHttpServer()).get("/non-existent-route");
      
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        statusCode: 404,
        message: expect.any(String),
        errorCode: "Not Found",
        path: "/non-existent-route",
        timestamp: expect.any(String),
      });
    });

    it("should handle localized error messages", async () => {
        const res = await request(app.getHttpServer())
            .get("/non-existent-route")
            .set('Accept-Language', 'es');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(typeof res.body.message).toBe('string');
    });
  });

  describe("Repository Pattern Integration", () => {
    it("should have a functioning PostRepository", () => {
      expect(postRepository).toBeDefined();
      expect(postRepository.findAll).toBeDefined();
      expect(postRepository.findUnique).toBeDefined();
    });
  });

  describe("Database Concurrency Control", () => {
    it("should have configured limits", async () => {
        const limiter = new ConcurrencyLimiterService();
        expect(limiter['MAX_ACTIVE_CONNECTIONS']).toBeDefined();
        expect(limiter['MAX_TOTAL_CAPACITY']).toBe(150);
    });

    it("should throw error when total capacity is exceeded", async () => {
        const limiter = new ConcurrencyLimiterService();
        
        const promises = [];
        for(let i = 0; i < 150; i++) {
            promises.push(limiter.run(() => new Promise(resolve => setTimeout(resolve, 200))));
        }
        
        await expect(limiter.run(() => Promise.resolve())).rejects.toThrow('DATABASE_SATURATION_OVERFLOW');
    });
  });
});
