const { Schema, model } = require("mongoose")

const schema = new Schema({
    TotalMapsPlayed: Number,
    Rating: Number,
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
