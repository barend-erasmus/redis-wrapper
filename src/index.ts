// Imports
import * as redis from 'redis';
import * as hash from 'object-hash';

export class RedisWrapper {

    public static getInstance(name: string, server: string, port: number): RedisWrapper {
        if (RedisWrapper.instance === null) {
            RedisWrapper.instance = new RedisWrapper(name, server, port);
        }
        return RedisWrapper.instance;
    }

    private static instance: RedisWrapper = null;
    private static redisClient: any = null;

    constructor(private name: string, private server: string, private port: number) {

    }

    public add(key: any, obj: any, expiry: number): Promise<boolean> {
        const sha1: string = hash(key);

        return this.getRedisClient().then((redisClient: any) => {
            return new Promise((resolve, reject) => {
                if (!key) {
                    resolve(false);
                    return;
                }

                redisClient.setex(sha1, expiry, JSON.stringify(obj));
                resolve(true);
            });
        });
    }

    public get<T>(key: any): Promise<T> {

        const sha1: string = hash(key);

        return this.getRedisClient().then((redisClient: any) => {
            return new Promise((resolve, reject) => {
                redisClient.get(sha1, (err: Error, reply: string) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(JSON.parse(reply));
                });
            });
        });
    }

    // public flush(): Promise<boolean> {

    //     const redisClient: any = this.getRedisClient();

    //     return new Promise((resolve, reject) => {

    //         redisClient.flushdb((err: Error, succeeded: boolean) => {
    //             if (err) {
    //                 reject(err);
    //                 return;
    //             }

    //             resolve(true);
    //         });
    //     });

    // }

    public close(): Promise<boolean> {

        return this.getRedisClient().then((redisClient: any) => {
            return new Promise<boolean>((resolve, reject) => {

                redisClient.end(true);
                RedisWrapper.instance = null;
                resolve(true);
            });
        });
    }

    private getRedisClient(): Promise<any> {

        if (RedisWrapper.redisClient !== null) {
            return Promise.resolve(RedisWrapper.redisClient);
        }

        RedisWrapper.redisClient = redis.createClient({
            host: this.server,
            port: this.port,
            retry_strategy: (options: any) => {
                if (options.error && options.error.code === 'ECONNREFUSED') {
                    return new Error('The server refused the connection');
                }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    return new Error('Retry time exhausted');
                }
                if (options.times_connected > 10) {
                    return undefined;
                }
                return Math.min(options.attempt * 100, 3000);
            },
        });

        return new Promise((resolve, reject) => {

            RedisWrapper.redisClient.on("connect", () => {
                resolve(RedisWrapper.redisClient);
            });
        });
    }
}