// MAAS Engine: InstalledShieldSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for tracking installed Shield modules.
 * @description When the Module Registry attaches a new Shield, it creates a record using
 * this schema. This provides a persistent inventory of all available Shields in the system,
 * their status, and their capabilities as defined by their manifest.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const InstalledShieldSchema = new Schema({
  // The unique, machine-readable ID from the Shield's manifest.
  // This is the primary key for identifying an installed Shield.
  moduleId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },

  // The current operational status of the Shield within the Engine.
  status: {
    type: String,
    required: true,
    enum: ['attached', 'detached', 'error'],
    default: 'detached'
  },

  // The version of the Shield, captured from its manifest upon attachment.
  version: {
    type: String,
    required: true
  },

  // A complete snapshot of the Shield's parsed manifest data.
  // Storing this in the DB allows the Engine to quickly access module capabilities
  // without needing to re-read and re-parse files from the disk.
  manifestData: {
    type: Schema.Types.Mixed,
    required: true
  },

  // The timestamp for when the Shield was last successfully attached.
  attachedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// const InstalledShield = mongoose.model('InstalledShield', InstalledShieldSchema);

module.exports = InstalledShieldSchema;
