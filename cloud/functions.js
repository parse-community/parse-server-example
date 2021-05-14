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
  let query = new Parse.Query("Plays")
  query.equalTo("UserId", Number.parseInt(req.params.userid))

  const results = await query.find();

  results.forEach(play => {
    play.set("Allowed", false)
  });

  await Parse.Object.saveAll(results)

  query = new Parse.Query("Global")
  query.equalTo("UserId", Number.parseInt(req.params.userid))

  const result = await query.first();

  if (result) {
    result.set("Allowed", false)
    result.save()
  }

  return { status: 200, success: true, message: "User successfully banned!" }
})

Parse.Cloud.define('unban', async req => {
  let query = new Parse.Query("Plays")
  query.equalTo("UserId", Number.parseInt(req.params.userid))

  const results = await query.find();

  results.forEach(play => {
    play.set("Allowed", true)
  });

  await Parse.Object.saveAll(results)

  query = new Parse.Query("Global")
  query.equalTo("UserId", Number.parseInt(req.params.userid))

  const result = await query.first();

  if (result) {
    result.set("Allowed", true)
    result.save()
  }

  return { status: 200, success: true, message: "User successfully unbanned!" }
})

Parse.Cloud.define('op1', async () => {
  let query = new Parse.Query("Plays")
  let results = await query.find();

  results.forEach(play => {
    play.unset("Banned")
    play.set("Allowed", true)
  });

  await Parse.Object.saveAll(results)

  query = new Parse.Query("Global")

  results = await query.find();

  results.forEach(play => {
    play.unset("Banned")
    play.set("Allowed", true)
  });

  await Parse.Object.saveAll(results)

  return { status: 200, success: true, message: "OP1 complete!" }
})

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});
