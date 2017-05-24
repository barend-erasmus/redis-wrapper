// Imports
import { expect } from 'chai';
import * as co from 'co';
import 'mocha';
import * as sinon from 'sinon';


import { RedisWrapper } from './index';

describe('RedisWrapper', () => {

  describe('add', () => {
    let redisWrapper: RedisWrapper = null;

    beforeEach(() => {

      redisWrapper = RedisWrapper.getInstance('region-1', 'redisserver1', 7001);

    });


    it('should return true given string as key', () => {
      return co(function* () {
        const result: boolean = yield redisWrapper.add('key1', { hello: 'world' }, 10);

        expect(result).to.be.true;
      });
    });

    it('should return true given object as key', () => {
      return co(function* () {
        const result: boolean = yield redisWrapper.add({ key: 'key1' }, { hello: 'world' }, 10);

        expect(result).to.be.true;
      });
    });

    it('should return false given null as key', () => {
      return co(function* () {
        const result: boolean = yield redisWrapper.add(null, { hello: 'world' }, 10);

        expect(result).to.be.false;
      });
    });
  });


  describe('get', () => {
    let redisWrapper: RedisWrapper = null;

    beforeEach(() => {

      redisWrapper = RedisWrapper.getInstance('region-1', 'redisserver1', 7001);

    });


    it('should return object given existing key', () => {
      return co(function* () {

        const result1: any = yield redisWrapper.add('key2', { hello: 'world' }, 10);

        const result: any = yield redisWrapper.get<any>('key2');

        expect(result.hello).to.be.eq('world');
      });
    });
  })
});

