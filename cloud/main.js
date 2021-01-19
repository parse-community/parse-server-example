Parse.Cloud.define('hello', (req) => {
  console.log(req)
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async (req) => {
  await new Promise((resolve) => setTimeout(resolve,1000));
  console.log(req)
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(211,'Saving test objects is not available.')
});
