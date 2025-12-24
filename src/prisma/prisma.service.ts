import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaOverrideService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static instance: PrismaOverrideService;
  private queue: (() => void)[] = [];
  private maxConcurrent = 16;
  private activeCount = 0;

  constructor() {
    super();
    if (PrismaOverrideService.instance) {
      return PrismaOverrideService.instance;
    }
    PrismaOverrideService.instance = this;

    // Middleware for throttling
    this.$use(async (params, next) => {
      return this.enqueue(() => next(params));
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("PrismaOverrideService connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private enqueue(fn: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.activeCount++;
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          console.log("query running", this.activeCount);
          console.log("query waiting", this.queue.length);
          this.activeCount--;
          if (this.queue.length > 0) {
            const nextFn = this.queue.shift();
            nextFn();
          }
        }
      };

      if (this.activeCount < this.maxConcurrent) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }
}
