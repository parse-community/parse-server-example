db = connect("localhost:27017/dev")

db.Plays.find({}).forEach(play => {
    const id = play._id
    play._id = undefined

    db.Plays.remove({ _id: id })

    db.Plays.insert(play)
})

db.Global.find({}).forEach(slot => {
    const id = slot._id
    slot._id = undefined

    db.Global.remove({ _id: id })

    db.Global.insert(slot)

    db.Global.updateOne({ _id: id }, { $set: { Elo: 500, RankedMatchesPlayed: 0 } })
})

db.Bans.find({}).forEach(ban => {
    const id = ban._id
    ban._id = undefined

    db.Bans.remove({ _id: id })

    db.Bans.insert(ban)
})