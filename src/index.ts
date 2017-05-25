// Imports
import * as Redis from 'ioredis';
import * as hash from 'object-hash';

export class RedisWrapper {

    public static getInstance(name: string, server: string, port: number): RedisWrapper {
        if (!RedisWrapper.instances[name]) {
            RedisWrapper.instances[name] = new RedisWrapper(name, server, port);
        }
        return RedisWrapper.instances[name];
    }

    private static instances: {} = {};
    private static redisClients: {} = {};

    constructor(private name: string, private server: string, private port: number) {

    }

    public add(key: any, obj: any, expiry: number): Promise<boolean> {
        return this.addWithServerAndPort(this.server, this.port, key, obj, expiry);
    }

    public get<T>(key: any): Promise<T> {
        return this.getWithServerAndPort(this.server, this.port, key);
    }

    public addWithServerAndPort(server: string, port: number,key: any, obj: any, expiry: number): Promise<boolean> { 
        const sha1: string = hash(key);

        return this.getRedisClient(server, port).then((redisClient: any) => {
            return new Promise((resolve, reject) => {
                if (!key) {
                    resolve(false);
                    return;
                }
                
                redisClient.setex(`${this.name}-${sha1}`, expiry, JSON.stringify(obj), (err: Error) => {
                    if (err) {
                        if (err.message.startsWith('MOVED')) {
                            const nodeServer: string = err.message.split(' ')[2].split(':')[0];
                            const nodePort: number = parseInt(err.message.split(' ')[2].split(':')[1]);

                            this.addWithServerAndPort(nodeServer, nodePort, key, obj, expiry).then((result: any) => {
                                resolve(result);
                            }).catch(reject);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(true);
                    }
                });

            });
        });
    }

    private getWithServerAndPort<T>(server: string, port: number, key: any): Promise<T> {
        const sha1: string = hash(key);

        return this.getRedisClient(server, port).then((redisClient: any) => {
            return new Promise((resolve, reject) => {
                redisClient.get(`${this.name}-${sha1}`, (err: Error, reply: string) => {
                    if (err) {
                        if (err.message.startsWith('MOVED')) {
                            const nodeServer: string = err.message.split(' ')[2].split(':')[0];
                            const nodePort: number = parseInt(err.message.split(' ')[2].split(':')[1]);

                            this.getWithServerAndPort(nodeServer, nodePort, key).then((json: any) => {
                                resolve(json);
                            }).catch(reject);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(JSON.parse(reply));
                    }
                });
            });
        });
    }

    public flush(): Promise<boolean> {

        const redisClient: any = this.getRedisClient(this.server, this.port);

        return new Promise((resolve, reject) => {

            redisClient.flushdb((err: Error, succeeded: boolean) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(true);
            });
        });

    }

    private getRedisClient(server: string, port: number): Promise<any> {

        if (RedisWrapper.redisClients[`${server}-${port}`]) {
            return Promise.resolve(RedisWrapper.redisClients[`${server}-${port}`]);
        }

        RedisWrapper.redisClients[`${server}-${port}`] = new Redis({
            port: port,
            host: server,
            family: 4
        })

        return new Promise((resolve, reject) => {

            RedisWrapper.redisClients[`${server}-${port}`].on("connect", () => {
                resolve(RedisWrapper.redisClients[`${server}-${port}`]);
            });
        });
    }
}