// MAAS Engine: SessionMembershipSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for Session Membership.
 * @description This is the critical "linking" table that connects a User to a Session
 * and defines their roles within that session's context. It is the implementation of
 * our "Provisional-First" identity model.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionMembershipSchema = new Schema({
  // A direct reference to the Session this membership belongs to.
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  
  // A direct, but optional, reference to a global User account.
  // This will be null for anonymous attendees who have not yet "claimed" their record.
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },

  // The primary identifier for an attendee within the context of a session.
  // This is always present, even for anonymous users, and is used for all
  // real-time state tracking.
  provisionalId: {
    type: String,
    required: true,
    unique: true, // A provisional ID must be unique across the entire system.
    index: true
  },
  
  // An array of strings defining the user's roles for this specific session.
  // e.g., ["attendee"], ["attendant"], or ["attendee", "attendant"]
  roles: {
    type: [String],
    required: true,
    default: ['attendee']
  },

}, {
  timestamps: true
});

// const SessionMembership = mongoose.model('SessionMembership', SessionMembershipSchema);

module.exports = SessionMembershipSchema;
