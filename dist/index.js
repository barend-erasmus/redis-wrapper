"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const Redis = require("ioredis");
const hash = require("object-hash");
class RedisWrapper {
    constructor(name, server, port) {
        this.name = name;
        this.server = server;
        this.port = port;
    }
    static getInstance(name, server, port) {
        if (!RedisWrapper.instances[name]) {
            RedisWrapper.instances[name] = new RedisWrapper(name, server, port);
        }
        return RedisWrapper.instances[name];
    }
    add(key, obj, expiry) {
        return this.addWithServerAndPort(this.server, this.port, key, obj, expiry);
    }
    get(key) {
        return this.getWithServerAndPort(this.server, this.port, key);
    }
    flush() {
        const redisClient = this.getRedisClient(this.server, this.port);
        return new Promise((resolve, reject) => {
            redisClient.flushdb((err, succeeded) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }
    addWithServerAndPort(server, port, key, obj, expiry) {
        const sha1 = hash(key);
        return this.getRedisClient(server, port).then((redisClient) => {
            return new Promise((resolve, reject) => {
                if (!key) {
                    resolve(false);
                    return;
                }
                redisClient.setex(`${this.name}-${sha1}`, expiry, JSON.stringify(obj), (err) => {
                    if (err) {
                        if (err.message.startsWith('MOVED')) {
                            const nodeServer = err.message.split(' ')[2].split(':')[0];
                            const nodePort = parseInt(err.message.split(' ')[2].split(':')[1], undefined);
                            this.addWithServerAndPort(nodeServer, nodePort, key, obj, expiry).then((result) => {
                                resolve(result);
                            }).catch(reject);
                        }
                        else {
                            reject(err);
                        }
                    }
                    else {
                        resolve(true);
                    }
                });
            });
        });
    }
    getWithServerAndPort(server, port, key) {
        const sha1 = hash(key);
        return this.getRedisClient(server, port).then((redisClient) => {
            return new Promise((resolve, reject) => {
                redisClient.get(`${this.name}-${sha1}`, (err, reply) => {
                    if (err) {
                        if (err.message.startsWith('MOVED')) {
                            const nodeServer = err.message.split(' ')[2].split(':')[0];
                            const nodePort = parseInt(err.message.split(' ')[2].split(':')[1], undefined);
                            this.getWithServerAndPort(nodeServer, nodePort, key).then((json) => {
                                resolve(json);
                            }).catch(reject);
                        }
                        else {
                            reject(err);
                        }
                    }
                    else {
                        resolve(JSON.parse(reply));
                    }
                });
            });
        });
    }
    getRedisClient(server, port) {
        if (RedisWrapper.redisClients[`${server}-${port}`]) {
            return Promise.resolve(RedisWrapper.redisClients[`${server}-${port}`]);
        }
        RedisWrapper.redisClients[`${server}-${port}`] = new Redis({
            family: 4,
            host: server,
            port,
        });
        return new Promise((resolve, reject) => {
            RedisWrapper.redisClients[`${server}-${port}`].on("connect", () => {
                resolve(RedisWrapper.redisClients[`${server}-${port}`]);
            });
        });
    }
}
RedisWrapper.instances = {};
RedisWrapper.redisClients = {};
exports.RedisWrapper = RedisWrapper;
