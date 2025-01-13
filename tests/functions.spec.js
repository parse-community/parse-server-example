import { hiFunction, asyncFunction, beforeSaveTest } from '../cloud/functions.js';
import jest from 'jest-mock';

describe('Cloud Functions', () => {
  describe('hiFunction', () => {
    it('should log the request and return "Hi"', () => {
      const req = { log: { info: jest.fn() } };

      const result = hiFunction(req);

      expect(req.log.info).toHaveBeenCalledWith(req);
      expect(result).toBe('Hi');
    });
  });

  describe('asyncFunction', () => {
    it('should log the request after a delay and return "Hi async"', async () => {
      const req = { log: { info: jest.fn() } };

      const result = await asyncFunction(req);

      expect(req.log.info).toHaveBeenCalledWith(req);
      expect(result).toBe('Hi async');
    });
  });

  describe('beforeSaveTest', () => {
    it('should throw a Parse.Error with code 9001 and appropriate message', () => {
      expect(() => beforeSaveTest()).toThrowError(new Parse.Error(9001, 'Saving test objects is not available.'));
    });
  });
});