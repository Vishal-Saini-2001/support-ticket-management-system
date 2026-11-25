const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically remove expired tokens once their JWT exp passes
revokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);

module.exports = RevokedToken;

