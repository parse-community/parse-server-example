const { Schema, model } = require("mongoose")

const schema = new Schema({
    _id: String,
    TotalMapsPlayed: Number,
    Rating: Number,
    PlayerName: String,
    UserId: Number,
    Accuracy: Number,
    CountryRegion: String
}, {
    timestamps: { createdAt: "_created_at", updatedAt: "_updated_at" }
})

module.exports = model("Profile", schema, "Global")
