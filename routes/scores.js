const Play = require("../models/play")
const Profile = require("../models/profile")

module.exports = function(fastify, opts, done) {
    function calculateOverallRating(scores) {
        let rating = 0;
        let maxNumOfScores = Math.min(scores.length, 25);
      
        scores.forEach((item, i) => {
            if (i > maxNumOfScores) {
                return false
            }
      
            if (i <= 10) {
                rating = rating + item.Rating * 1.5
            } else {
                rating = rating + item.Rating;
            }
        })
      
        return Math.floor((100 * rating) / 30) / 100
      }

    function calculateOverallAccuracy(scores) {
        let accuracy = 0

        scores.forEach(score => {
            accuracy += score.Accuracy
        })

        return accuracy / scores.length
    }

    fastify.get("/", { preHandler: fastify.protected }, async (request, reply) => {
        let filter = { SongMD5Hash: request.query.hash, Allowed : true }

        if (request.query.rate) {
            filter.Rate = Number.parseInt(request.query.rate)
        }

        const query = Play.find(filter).sort("-Rating").limit(request.query.limit ? Number.parseInt(request.query.limit) : 50)

        reply.send(await query)
    })

    fastify.post("/", { preHandler: fastify.protected }, async (request, reply) => {
        const {
            Perfects,
            Accuracy,
            Mean,
            MaxChain,
            Greats,
            Misses,
            Goods,
            Rate,
            PlayerName,
            Mods,
            Score,
            Bads,
            Rating,
            UserId,
            Marvelouses,
            SongMD5Hash,
            CountryRegion
        } = request.body
        
        let oldScore = await Play.findOne({ SongMD5Hash: SongMD5Hash, UserId: UserId })

        if (oldScore) {
            if (Rating > oldScore.Rating || (oldScore.Rating == 0 && Score > oldScore.Score)) {
                oldScore.Perfects = Perfects
                oldScore.Accuracy = Accuracy
                oldScore.Mean = Mean
                oldScore.MaxChain = MaxChain
                oldScore.Greats = Greats
                oldScore.Misses = Misses
                oldScore.Goods = Goods
                oldScore.Rate = Rate
                oldScore.PlayerName = PlayerName
                oldScore.Mods = Mods
                oldScore.Score = Score
                oldScore.Bads = Bads
                oldScore.Rating = Rating
                oldScore.UserId = UserId
                oldScore.Marvelouses = Marvelouses
                oldScore.SongMD5Hash = SongMD5Hash

                await oldScore.save()
            }
        } else {
            const score = new Play({
                Perfects: Perfects,
                Accuracy: Accuracy,
                Mean: Mean,
                MaxChain: MaxChain,
                Greats: Greats,
                Misses: Misses,
                Goods: Goods,
                Rate: Rate,
                PlayerName: PlayerName,
                Mods: Mods,
                Score: Score,
                Bads: Bads,
                Rating: Rating,
                UserId: UserId,
                Marvelouses: Marvelouses,
                SongMD5Hash: SongMD5Hash,
                Allowed: true
            })

            await score.save()
        }

        const playerScores = await Play.find({ UserId: UserId }).sort("-Rating")

        const overall = calculateOverallRating(playerScores)
        const accuracy = calculateOverallAccuracy(playerScores)

        await Profile.updateOne({ UserId: UserId }, {
            PlayerName: PlayerName,
            Accuracy: accuracy,
            CountryRegion: CountryRegion,
            Rating: overall,
            $inc: {
                TotalMapsPlayed: 1
            }
        }, {
            upsert: true
        })

        reply.send({ok: "ok"})
    })

    fastify.delete("/", { preHandler: fastify.protected }, async (request, reply) => {
        await Play.deleteOne({ _id: request.query.id })

        reply.send({message: "score went bye bye"})
    })

    fastify.get("/player", { preHandler: fastify.protected }, async (request, reply) => {
        const plays = await Play.find({ UserId: Number.parseInt(request.query.userid) }).sort("-Rating")

        reply.send(plays)
    })

    done()
}