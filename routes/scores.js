const Play = require("../models/play")
const Profile = require("../models/profile")

module.exports = function(fastify, opts, done) {
    function getRating(topScores) {
        let rating = 0;
        let maxNumOfScores = 25;
        for (let i = 0; i < maxNumOfScores; i++) {
            if (topScores[i] != null) {
                if (i <= 10) {
                    rating = rating + topScores[i].Rating * 1.5;
                } else {
                    rating = rating + topScores[i].Rating;
                }
            }
        }
        rating = Math.floor((100 * rating) / 30) / 100;
        return rating;
    }

    function getAccuracy(scores) {
        let accuracy = 0

        scores.forEach(score => {
            accuracy += score.Accuracy
        })

        return accuracy / scores.length
    }

    fastify.get("/", { preHandler: fastify.protected }, (request, reply) => {
        Play.find({SongMD5Hash: request.query.hash}).sort("-Rating").exec((err, results) => {
            if (err) {
                reply.status(500).send({error: err})
                return
            }

            reply.send(results)
        })
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

        console.log(oldScore.toJSON())

        if (oldScore) {
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
        } else {
            if (Rating > oldScore.Rating || (oldScore.Rating == 0 && Score > oldScore.Score)) {
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

                score.save()
            }
        }

        const playerScores = await Play.find({ UserId: UserId })

        const overall = getRating(playerScores)
        const accuracy = getAccuracy(playerScores)

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

    done()
}