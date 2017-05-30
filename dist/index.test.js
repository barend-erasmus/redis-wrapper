"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const chai_1 = require("chai");
const co = require("co");
require("mocha");
const index_1 = require("./index");
describe('RedisWrapper', () => {
    describe('add', () => {
        // beforeEach(() => {
        // });
        it('should return true given string as key', () => {
            return co(function* () {
                const redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result = yield redisWrapper.add('key1', { hello: 'world' }, 10);
                chai_1.expect(result).to.be.true;
            });
        });
        it('should return true given object as key', () => {
            return co(function* () {
                const redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result = yield redisWrapper.add({ key: 'key1' }, { hello: 'world' }, 10);
                chai_1.expect(result).to.be.true;
            });
        });
        it('should return false given null as key', () => {
            return co(function* () {
                const redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result = yield redisWrapper.add(null, { hello: 'world' }, 10);
                chai_1.expect(result).to.be.false;
            });
        });
    });
    describe('get', () => {
        // beforeEach(() => {
        // });
        it('should return object given existing key', () => {
            return co(function* () {
                const redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result1 = yield redisWrapper.add('key2', { hello: 'world' }, 10);
                const result = yield redisWrapper.get('key2');
                chai_1.expect(result.hello).to.be.eq('world');
            });
        });
        it('should return object given existing key on different node', () => {
            return co(function* () {
                let redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result1 = yield redisWrapper.add('key3', { hello: 'world' }, 10);
                redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7002);
                const result = yield redisWrapper.get('key3');
                chai_1.expect(result.hello).to.be.eq('world');
            });
        });
        it('should return null given non-existing key', () => {
            return co(function* () {
                const redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result = yield redisWrapper.get('key4');
                chai_1.expect(result).to.be.null;
            });
        });
        it('should return null given existing key on different name', () => {
            return co(function* () {
                let redisWrapper = index_1.RedisWrapper.getInstance('region-1', 'redisserver2', 7001);
                const result1 = yield redisWrapper.add('key5', { hello: 'world' }, 10);
                redisWrapper = index_1.RedisWrapper.getInstance('region-2', 'redisserver2', 7001);
                const result = yield redisWrapper.get('key5');
                chai_1.expect(result).to.be.null;
            });
        });
    });
});
