// MAAS Engine: InstalledFeatureSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for tracking installed Feature modules.
 * @description This schema creates a persistent record for each attached Feature, storing
 * its manifest data and, most importantly, the status of its permission requests. This
 * record is the source of truth for the Engine's permission registry.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const PermissionSchema = new Schema({
  // The name of the permission, e.g., "engine.state.update"
  name: {
    type: String,
    required: true,
  },
  // A description of the permission, copied from the manifest.
  description: {
    type: String,
    default: ''
  },
  // Whether the permission was marked as required by the Feature.
  required: {
    type: Boolean,
    default: true
  },
  // The critical field: whether the MAAS Engine has granted this permission.
  // This is determined by the Engine's security policy and an admin's approval.
  // This is the value the DBModule will check.
  isGranted: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false }); // _id is not needed for subdocuments in this array

const InstalledFeatureSchema = new Schema({
  // The unique, machine-readable ID from the Feature's manifest.
  moduleId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },

  // The current operational status of the Feature within the Engine.
  status: {
    type: String,
    required: true,
    enum: ['attached', 'detached', 'error', 'pending_approval'],
    default: 'detached'
  },

  // The version of the Feature, captured from its manifest.
  version: {
    type: String,
    required: true
  },

  // A complete snapshot of the Feature's parsed manifest data.
  manifestData: {
    type: Schema.Types.Mixed,
    required: true
  },

  // The list of permissions requested by the Feature and their granted status.
  permissions: [PermissionSchema],

  // The timestamp for when the Feature was last successfully attached.
  attachedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// const InstalledFeature = mongoose.model('InstalledFeature', InstalledFeatureSchema);

module.exports = InstalledFeatureSchema;
