const { Schema, model } = require("mongoose")

const Rating = new Schema({
    Chordjack: Number,
    Handstream: Number,
    Jack: Number,
    Jumpstream: Number,
    Stamina: Number,
    Stream: Number,
    Technical: Number,
})

const schema = new Schema({
    TotalMapsPlayed: Number,
    Rating: Rating,
    PlayerName: String,
    UserId: Number,
    Accuracy: Number,
    CountryRegion: String,
    Elo: { type: Number, default: 500 },
    Allowed: Boolean
}, {
    timestamps: { createdAt: "_created_at", updatedAt: "_updated_at" }
})

module.exports = model("Profile", schema, "Global")
