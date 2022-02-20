const Play = require("../models/play")
const Profile = require("../models/profile")

// if x == 100 then return 110
// elseif x >= 90 then return -116640 + (64595/18)*x - (9937/270)*x^2 + (17/135)*x^3
// elseif x >= 85 then return 6040 - (851/6)*x + (5/6)*x^2
// elseif x >= 75 then return 0.5*x - 37.5
// else return 0 end

const weightPercentage = (value) => {
    if (value === 100)
        return 110;
    else if (value >= 90)
        return -116640 + (64595/18) * value - (9937/270)*Math.pow(value, 2) + (17/135)*Math.pow(value, 3);
    else if (value >= 85)
        return 6040 - (851/6) * value + (5/6) * Math.pow(value, 2);
    else if (value >= 75)
        return 0.5 * value - 37.5;
    else
        return 0;
}

const calculateDifficulty = (difficulty, rate) => {
    if (rate == 1) {
        return difficulty
    } else if (rate < 1) {
        return difficulty * (459616.4 + (-0.008317092 - 459616.4)/(1 + Math.pow(rate/5051.127, 1.532436)))
    } else {
        return difficulty * (946.4179 + (-6.728875 - 946.4179)/(1 + Math.pow(rate/85114960, 0.2634697)))
    }
}

module.exports = function(fastify, opts, done) {
    const calculateRating = (difficulty, accuracy) => {
        return difficulty * weightPercentage(accuracy) / 100
    }

    const calculateOverallRating = (scores) => {
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

    async function recalculateUser(userId, filter = {}) {
        const playerScores = await Play.find({ UserId: userId }).sort("-Rating")

        const overall = calculateOverallRating(playerScores)
        const accuracy = calculateOverallAccuracy(playerScores)

        let update = {
            Accuracy: accuracy,
            Rating: overall,
            ...filter
        }

        await Profile.updateOne({ UserId: userId }, update, {
            upsert: true
        })
    }

    fastify.get("/", { preHandler: fastify.protected }, async (request, reply) => {
        let filter = { SongMD5Hash: request.query.hash, Allowed : true }

        if (request.query.rate) {
            filter.Rate = Number.parseInt(request.query.rate)
        }

        const query = Play.find(filter).sort({ "Rating": -1, "Score": -1 }).limit(request.query.limit ? Number.parseInt(request.query.limit) : 50)

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

        await recalculateUser(UserId, {
            PlayerName: PlayerName,
            CountryRegion: CountryRegion
        })

        reply.send({ok: "ok"})
    })

    fastify.post("/rerate", { preHandler: fastify.protected }, async (request, reply) => {
        const baseDifficulty = Number.parseInt(request.query.difficulty)

        if (!request.query.hash) {
            throw new Error("Hash must be specified!")
        }

        for await (const element of Play.find({ SongMD5Hash: request.query.hash })) {
            const difficulty = calculateDifficulty(baseDifficulty, element.Rate / 100)

            element.Rating = calculateRating(difficulty, element.Accuracy, element.Rate / 100)

            await element.save()

            await recalculateUser(element.UserId)
        }

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