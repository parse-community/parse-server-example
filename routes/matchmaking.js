const Match = require("../models/match")
const Profile = require("../models/profile")

const Elo = require("arpad")

module.exports = (fastify, opts, done) => {
    const elo = new Elo()

    fastify.get("/", (request, reply) => {
        reply.send({})
    })

    fastify.get("/elo", (request, reply) => {
        const player = Number.parseInt(request.query.player)
        const opponent = Number.parseInt(request.query.opponent)

        let newElo

        if (request.query.condition == "won") {
            newElo = elo.newRatingIfWon(player, opponent)
        } else if (request.query.condition == "lost") {
            newElo = elo.newRatingIfLost(player, opponent)
        } else if (request.query.condition == "tied") {
            newElo = elo.newRatingIfTied(player, opponent)
        }

        reply.send({ elo: newElo })
    })

    fastify.post("/match", async (request, reply) => {
        await Match.findOneAndDelete({ UserId: Number.parseInt(request.query.userid) })

        const profile = await Profile.findOne({ UserId: Number.parseInt(request.query.userid) })

        const matchRequest = new Match({
            UserId: Number.parseInt(request.query.userid),
            PlayerName: request.query.playername,
            Elo: profile.Elo
        })

        reply.send()
    })

    done()
}