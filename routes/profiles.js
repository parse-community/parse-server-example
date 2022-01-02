const Profile = require("../models/profile")

module.exports = (fastify, opts, done) => {
    fastify.get("/", { preHandler: fastify.protected }, async (request, reply) => {
        const profile = await Profile.findOne({ "UserId": Number.parseInt(request.query.userid) })

        const rank = profile ? (await Profile.countDocuments({ "Rating": { $gt: profile.Rating } })) + 1 : undefined

        console.log(rank)

        reply.send({
          Rank: rank,
          ...profile.toObject()
        })
    })

    fastify.get("/top", { preHandler: fastify.protected }, async (request, reply) => {
      const players = await Profile.find({ Allowed: true }).sort("-Rating").limit(50)

      reply.send(players)
    })

    done()
}