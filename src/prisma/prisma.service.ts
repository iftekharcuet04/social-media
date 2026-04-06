import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaOverrideService implements OnModuleInit, OnModuleDestroy {
  private static instance: PrismaOverrideService;
  private queue: (() => void)[] = [];
  private maxConcurrent = 16;
  private activeCount = 0;
  
  // The actual Prisma Client that will be used for all operations
  public readonly client;

  constructor() {
    if (PrismaOverrideService.instance) {
      return PrismaOverrideService.instance;
    }
    PrismaOverrideService.instance = this;

    const baseClient = new PrismaClient();
    
    // Prisma 6 Throttling Extension
    this.client = baseClient.$extends({
      query: {
        $allOperations: async ({ args, query }) => {
          return this.enqueue(() => query(args));
        }
      }
    });
  }

  async onModuleInit() {
    // Note: client.$connect() is available on the extended client
    await (this.client as any).$connect();
    console.log("PrismaOverrideService connected");
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect();
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
          this.activeCount--;
          if (this.queue.length > 0) {
            const nextFn = this.queue.shift();
            if (nextFn) nextFn();
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
