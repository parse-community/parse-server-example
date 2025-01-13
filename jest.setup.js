import jest from 'jest-mock';
global.Parse = {
  Cloud: {
    define: jest.fn(),
    beforeSave: jest.fn(),
    run: jest.fn(),
  },
  Error: class ParseError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  },
}