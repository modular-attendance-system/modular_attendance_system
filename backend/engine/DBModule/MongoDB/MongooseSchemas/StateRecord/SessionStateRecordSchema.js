// MAAS Engine: SessionStateRecordSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for the Session State Record.
 * @description This schema is the single, authoritative source of truth for an attendee's
 * current validation state within a specific session. It is designed to be transactional
 * and prevent race conditions between the standard Voting Aggregator and authoritative
 * Resolvers through a state locking mechanism.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionStateRecordSchema = new Schema({
  // A direct reference to the Session this state record belongs to.
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session', // Assuming a 'Session' model will be created
    required: true,
    index: true
  },

  // The unique identifier for the attendee within this session's context.
  // This is the primary key for looking up an attendee's state.
  provisionalId: {
    type: String,
    required: true,
    index: true
  },

  // The current, authoritative state of the attendee.
  currentState: {
    type: String,
    required: true,
    enum: [
      'Satisfied',
      'Not Satisfied',
      'Suspicious',
      'Partially Satisfied',
      'Not Applicable'
    ],
    default: 'Not Applicable'
  },

  // A flexible field to store additional context about the current state.
  // - For 'Partially Satisfied': { partialValue: 75, partialUnit: 'percent' }
  // - For 'Suspicious' or 'Not Applicable': { reason: 'GPS signal lost in tunnel.' }
  stateMetadata: {
    type: Schema.Types.Mixed,
    default: null
  },

  // An audit field to track which module made the last update.
  // e.g., 'maas.engine.aggregator' or 'maas.feature.fraud_detector'
  lastUpdatedBy: {
    type: String,
    required: true
  },

  // A mechanism to prevent the Aggregator from overwriting state while a
  // Resolver is performing an authoritative investigation.
  stateLock: {
    isLocked: {
      type: Boolean,
      default: false
    },
    // The moduleId of the Resolver that acquired the lock.
    lockedBy: {
      type: String,
      default: null
    },
    lockedAt: {
      type: Date,
      default: null
    },
    lockReason: {
      type: String,
      default: null
    }
  }

}, {
  // Mongoose will automatically manage `createdAt` and `updatedAt` fields.
  timestamps: true
});

// --- Compound Index ---

/**
 * Creates a compound unique index on `sessionId` and `provisionalId`.
 * This is a critical data integrity constraint that ensures there can only ever be
 * one state record for a given attendee within a given session. This also makes
 * lookups for a specific attendee's status extremely fast.
 */
SessionStateRecordSchema.index({ sessionId: 1, provisionalId: 1 }, { unique: true });

// const SessionStateRecord = mongoose.model('SessionStateRecord', SessionStateRecordSchema);

module.exports = SessionStateRecordSchema;
