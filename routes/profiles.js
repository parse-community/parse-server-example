const profile = require("../models/profile")

module.exports = (fastify, opts, done) => {
    fastify.get("/", async (request, reply) => {
        const pipeline = [
            {
              $match: {
                "Allowed": true
              }
            },
            {
              $sort: {
                "Rating": -1
              }
            },
            {
              $group: {
                "_id": null,
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
              $unwind: {
                path: "$slots",
                includeArrayIndex: "Rank"
              }
            },
            {
              $replaceRoot: {
                "newRoot": {
                  "Rating": "$slots.Rating",
                  "TotalMapsPlayed": "$slots.TotalMapsPlayed",
                  "CountryRegion": "$slots.CountryRegion",
                  "Accuracy": "$slots.Accuracy",
                  "PlayerName": "$slots.PlayerName",
                  "UserId": "$slots.UserId",
                  "Rank": {
                    $add: ["$Rank", 1]
                  }
                },
              }
            },
            {
                $match: {
                    "UserId": Number.parseInt(request.query.userid)
                }
            }
        ]

        const results = await profile.aggregate(pipeline)

        reply.send(results[0])
    })

    fastify.get("/top", async (request, reply) => {
      const players = await profile.find({ Allowed: true }).sort("-Rating").limit(50)

      reply.send(players)
    })

    done()
}