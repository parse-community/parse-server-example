const Ban = require("../models/ban")
const Play = require("../models/play")
const Profile = require("../models/profile")

module.exports = (fastify, opts, done) => {
    fastify.get("/", { preHandler: fastify.protected }, async (request, reply) => {
        const ban = await Ban.findOne({ UserId: Number.parseInt(request.query.userid) })

        reply.send(ban)
    })

    fastify.post("/", { preHandler: fastify.protected }, async (request, reply) => {
        const ban = new Ban({
            UserId: Number.parseInt(request.query.userid),
            Reason: request.query.reason
        })

        await ban.save()
        
        await Play.updateMany({ UserId: Number.parseInt(request.query.userid) }, { Allowed: false })
        await Profile.findOneAndUpdate({ UserId: Number.parseInt(request.query.userid) }, { Allowed: false })

        reply.send("User was banned!")
    })

    fastify.delete("/", { preHandler: fastify.protected }, async (request, reply) => {
        await Ban.findOneAndDelete({ UserId: Number.parseInt(request.query.userid) })
        await Play.updateMany({ UserId: Number.parseInt(request.query.userid) }, { Allowed: true })
        await Profile.findOneAndUpdate({ UserId: Number.parseInt(request.query.userid) }, { Allowed: true })

        reply.send("User was unbanned!")
    })

    done()
}