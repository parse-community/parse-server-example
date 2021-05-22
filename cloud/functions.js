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
  const userid = parseInt(req.params.userid)
  const reason = req.params.reason || "You are banned from joining RoBeats CS!"

  let query = new Parse.Query("Plays")
  query.equalTo("UserId", userid)

  const results = await query.find();

  results.forEach(play => {
    play.set("Allowed", false)
  });

  await Parse.Object.saveAll(results)

  query = new Parse.Query("Global")
  query.equalTo("UserId", userid)

  let result = await query.first();

  if (result) {
    result.set("Allowed", false)
    result.save()
  }

  query = new Parse.Query("Bans")
  query.equalTo("UserId", userid)

  result = await query.first();

  if (!result) {
    const banObject = new Parse.Object("Bans")
    banObject.set("UserId", userid)
    banObject.set("Reason", reason)

    banObject.save()
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

  let result = await query.first();

  if (result) {
    result.set("Allowed", true)
    result.save()
  }

  query = new Parse.Query("Bans")
  query.equalTo("UserId", Number.parseInt(req.params.userid))

  result = await query.first();

  if (result) {
    await result.destroy()
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

Parse.Cloud.define('profile', async req => {
  const userid = Number.parseInt(req.params.userid)

  const query = new Parse.Query("Global")

  const pipeline = [
    {
      sort: {
        "Rating": -1
      }
    },
    {
      group: {
        "objectId": null,
        "slots": {
          $push: {
            "Rating": "$Rating",
            "TotalMapsPlayed": "$TotalMapsPlayed",
            "CountryRegion": "$CountryRegion",
            "Accuracy": "$Accuracy",
            "PlayerName": "$PlayerName",
            "UserId": "$UserId"
          }
        }
      }
    },
    {
      unwind: {
        path: "$slots",
        includeArrayIndex: "Rank"
      }
    },
    {
      replaceRoot: {
        "newRoot": {
          "Rating": "$slots.Rating",
          "TotalMapsPlayed": "$slots.TotalMapsPlayed",
          "CountryRegion": "$slots.CountryRegion",
          "Accuracy": "$slots.Accuracy",
          "PlayerName": "$slots.PlayerName",
          "UserId": "$slots.UserId",
          "Rank": "$Rank"
        },
      }
    },
    {
      match: {
        "UserId": userid
      }
    }
  ]

  const slots = await query.aggregate(pipeline)

  return slots[0]
})

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});
