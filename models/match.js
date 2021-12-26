const { Schema, model } = require("mongoose")

const schema = new Schema({
    UserId: Number,
    PlayerName: String,
    Elo: Number
}, {
    timestamps: { createdAt: "_created_at", updatedAt: "_updated_at" }
})

module.exports = model("Match", schema, "Matches")
