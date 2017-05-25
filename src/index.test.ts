// Imports
import { expect } from 'chai';
import * as co from 'co';
import 'mocha';
import * as sinon from 'sinon';


import { RedisWrapper } from './index';

describe('RedisWrapper', () => {

  describe('add', () => {

    beforeEach(() => {


    });


    it('should return true given string as key', () => {
      return co(function* () {

        const redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result: boolean = yield redisWrapper.add('key1', { hello: 'world' }, 10);

        expect(result).to.be.true;
      });
    });

    it('should return true given object as key', () => {
      return co(function* () {

        const redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result: boolean = yield redisWrapper.add({ key: 'key1' }, { hello: 'world' }, 10);

        expect(result).to.be.true;
      });
    });

    it('should return false given null as key', () => {
      return co(function* () {

        const redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result: boolean = yield redisWrapper.add(null, { hello: 'world' }, 10);

        expect(result).to.be.false;
      });
    });
  });


  describe('get', () => {

    beforeEach(() => {

    });


    it('should return object given existing key', () => {
      return co(function* () {

        const redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result1: any = yield redisWrapper.add('key2', { hello: 'world' }, 10);

        const result: any = yield redisWrapper.get<any>('key2');

        expect(result.hello).to.be.eq('world');
      });
    });

    it('should return object given existing key on different node', () => {
      return co(function* () {

        let redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result1: any = yield redisWrapper.add('key3', { hello: 'world' }, 10);

        redisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7002);

        const result: any = yield redisWrapper.get<any>('key3');

        expect(result.hello).to.be.eq('world');
      });
    });

    it('should return null given non-existing key', () => {
      return co(function* () {

        const redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result: any = yield redisWrapper.get<any>('key4');

        expect(result).to.be.null;
      });
    });

    it('should return null given existing key on different name', () => {
      return co(function* () {

        let redisWrapper: RedisWrapper = RedisWrapper.getInstance('region-1', 'redisserver2', 7001);

        const result1: any = yield redisWrapper.add('key5', { hello: 'world' }, 10);

        redisWrapper = RedisWrapper.getInstance('region-2', 'redisserver2', 7001);

        const result: any = yield redisWrapper.get<any>('key5');

        expect(result).to.be.null;
      });
    });

  });
});

