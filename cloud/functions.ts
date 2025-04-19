Parse.Cloud.define('hello', req => {
  // @ts-ignore
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('helloAsyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // @ts-ignore
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('TestObject', () => {
  throw new Parse.Error(Parse.Error.OTHER_CAUSE, 'Saving test objects is not available.');
});

export {};
