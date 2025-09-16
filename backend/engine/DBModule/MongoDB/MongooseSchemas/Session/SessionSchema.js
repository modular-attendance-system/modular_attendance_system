// MAAS Engine: SessionSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for a Session.
 * @description This schema represents the core "event" or "context" in MAAS. It holds all
 * the configuration and rules that govern how validation will be performed for a specific
 * period and a specific group of users.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
  // A human-readable name for the session, e.g., "CS 101 Fall Semester".
  name: {
    type: String,
    required: true,
    trim: true
  },

  // The current lifecycle status of the session.
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'completed', 'archived'],
    default: 'pending'
  },

  // The high-level, human-friendly configuration object provided by the Attendant's UI.
  // This is the raw input for the Session Decoder.
  attendant_config: {
  type: Object,
  required: true
},

  // The low-level, machine-readable instructions produced by the Session Decoder.
  // This is what the Scheduler and Voting Aggregator will execute.
  session_compiled_data: {
    type: Schema.Types.Mixed,
    default: null
  },

  // An array of references to the SessionMembership documents that define who the
  // attendants are for this session.
  attendants: [{
    type: Schema.Types.ObjectId,
    ref: 'SessionMembership'
  }],

  // The scheduled start and end times for the session.
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// const Session = mongoose.model('Session', SessionSchema);

module.exports = SessionSchema;
