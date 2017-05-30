export declare class RedisWrapper {
    private name;
    private server;
    private port;
    static getInstance(name: string, server: string, port: number): RedisWrapper;
    private static instances;
    private static redisClients;
    constructor(name: string, server: string, port: number);
    add(key: any, obj: any, expiry: number): Promise<boolean>;
    get<T>(key: any): Promise<T>;
    flush(): Promise<boolean>;
    private addWithServerAndPort(server, port, key, obj, expiry);
    private getWithServerAndPort<T>(server, port, key);
    private getRedisClient(server, port);
}
