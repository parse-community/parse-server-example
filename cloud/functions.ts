Parse.Cloud.define('hello', req => {
  // @ts-expect-error req.log exists, but it was not added to types/parse
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('helloAsyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // @ts-expect-error req.log exists, but it was not added to types/parse
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('TestObject', () => {
  throw new Parse.Error(Parse.Error.OTHER_CAUSE, 'Saving test objects is not available.');
});
