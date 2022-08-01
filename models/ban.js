const { Schema, model } = require("mongoose")

const schema = new Schema({
    UserId: Number,
    Reason: { type: String, default: "You have been banned from joining RoBeats Community Server!" }
})

module.exports = model("Ban", schema, "Bans")