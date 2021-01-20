Parse.Cloud.define('hello', (req) => {
  request.log.info(req)
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async (req) => {
  await new Promise((resolve) => setTimeout(resolve,1000));
  request.log.info(req)
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(212,'Saving test objects is not available.')
});
