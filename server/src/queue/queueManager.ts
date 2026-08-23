import { Queue, Worker, Processor, JobsOptions } from 'bullmq';
import { getRedisClient, isRedisAvailable } from '../config/redis';
import logger from '../logs/logger';

interface InMemoryJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  timer?: NodeJS.Timeout;
}

export class ResilientQueue<T = unknown> {
  private bullQueue: Queue<T> | null = null;
  private queueName: string;
  private inMemoryJobs: Map<string, InMemoryJob<T>> = new Map();
  private processor: Processor<T> | null = null;

  constructor(name: string) {
    this.queueName = name;
    this.initBullQueue();
  }

  private initBullQueue() {
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      try {
        this.bullQueue = new Queue<T>(this.queueName, {
          connection: redis,
        });
        logger.info(` [Queue] BullMQ initialized for "${this.queueName}".`);
      } catch {
        this.bullQueue = null;
      }
    }
  }

  public async add(jobName: string, data: T, opts?: JobsOptions): Promise<string> {
    const delayMs = opts?.delay || 0;
    const jobId = `${this.queueName}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (this.bullQueue && isRedisAvailable()) {
      try {
        const job = await this.bullQueue.add(jobName as any, data as any, opts);
        return job.id || jobId;
      } catch (err) {
        logger.warn({ err }, `⚠️ Failed to enqueue in Redis for ${this.queueName}. Falling back to memory.`);
      }
    }

    // In-memory fallback
    const jobRecord: InMemoryJob<T> = { id: jobId, name: jobName, data };
    if (delayMs > 0) {
      jobRecord.timer = setTimeout(async () => {
        if (this.processor) {
          try {
            await this.processor({ id: jobId, name: jobName, data } as any);
          } catch (e) {
            logger.error({ err: e }, `❌ In-memory job ${jobId} execution error:`);
          }
        }
        this.inMemoryJobs.delete(jobId);
      }, delayMs);
    } else {
      setImmediate(async () => {
        if (this.processor) {
          try {
            await this.processor({ id: jobId, name: jobName, data } as any);
          } catch (e) {
            logger.error({ err: e }, `❌ In-memory job ${jobId} execution error:`);
          }
        }
        this.inMemoryJobs.delete(jobId);
      });
    }

    this.inMemoryJobs.set(jobId, jobRecord);
    logger.debug(`🕒 Enqueued job "${jobName}" (ID: ${jobId}, delay: ${delayMs}ms).`);
    return jobId;
  }

  public setProcessor(processor: Processor<T>): void {
    this.processor = processor;
    const redis = getRedisClient();

    if (redis && isRedisAvailable()) {
      try {
        new Worker<T>(this.queueName, processor, { connection: redis });
        logger.info(`👷 BullMQ worker active for "${this.queueName}".`);
      } catch {
        logger.info(`👷 In-memory worker active for "${this.queueName}".`);
      }
    } else {
      logger.info(`👷 In-memory worker active for "${this.queueName}".`);
    }
  }
}
