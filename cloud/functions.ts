Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('helloAsyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.define('getRecentObjects', async req => {
  const { className, limit = 5 } = req.params;

  if (!className || typeof className !== 'string') {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'className parameter is required.');
  }
  if (typeof limit !== 'number' || limit < 1 || limit > 100) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'limit must be a number between 1 and 100.');
  }

  const query = new Parse.Query(className);
  query.descending('createdAt');
  query.limit(limit);

  const results = await query.find({ useMasterKey: true });
  return results.map(obj => ({ id: obj.id, ...obj.attributes }));
});

Parse.Cloud.beforeSave('TestObject', () => {
  throw new Parse.Error(Parse.Error.OTHER_CAUSE, 'Saving test objects is not available.');
});
