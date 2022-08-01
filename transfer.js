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