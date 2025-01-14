import jest from 'jest-mock';
import '../../cloud/Hello/functions';

describe('Cloud Functions', () => {
  describe('hiFunction', () => {
    it('should log the request and return "Hi"', () => {
      const req = { log: { info: jest.fn() } };

      const result = Parse.Cloud.getTrigger('define', 'hello')(req);

      expect(req.log.info).toHaveBeenCalledWith(req);
      expect(result).toBe('Hi');
    });
  });

  describe('helloAsyncFunction', () => {
    it('should log the request and return "Hello, async!"', async () => {
      const req = { log: { info: jest.fn() } };
      jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

      const result = await Parse.Cloud.getTrigger('define', 'helloAsyncFunction')(req);

      expect(req.log.info).toHaveBeenCalledWith(req);
      expect(result).toBe('Hi async');
    });
  })
});
