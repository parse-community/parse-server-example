Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.define('ban', async req => {
  const query = new Parse.Query("Plays")
  query.equalTo("UserId", req.params.userid)

  const results = await query.find();

  results.forEach(play => {
    play.set("Banned", true)
  });

  Parse.Object.saveAll(results)
})

Parse.Cloud.define('unban', async req => {
  const query = new Parse.Query("Plays")
  query.equalTo("UserId", req.params.userid)

  const results = await query.find();

  results.forEach(play => {
    play.set("Banned", false)
  });

  Parse.Object.saveAll(results)
})

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});
