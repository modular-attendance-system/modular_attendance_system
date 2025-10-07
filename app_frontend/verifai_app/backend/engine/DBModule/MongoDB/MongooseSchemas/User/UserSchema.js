// MAAS Engine: UserSchema.js
// Document Version: 1.1
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for the core User model.
 * @description This schema represents the global, permanent identity of a user in the MAAS
 * system. Following our architectural principles, this model is intentionally lean and
 * contains only the essential information required for authentication and system-wide
 * identification. It now includes a direct reference to all properties owned by the user
 * from the UserProperties collection for efficient data retrieval.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
  // The primary email address used for login and communication.
  // It is required, must be unique, and will be indexed for fast lookups.
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address.'
    ]
  },

  // The hashed password for the user. It is required for local authentication.
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 8,
    select: false // This ensures the password hash is not sent back in query results by default
  },

  // Basic display name for the user.
  displayName: {
    type: String,
    required: [true, 'Please provide a display name.'],
    trim: true
  },

  // An array of references to the user's properties in the UserProperties collection.
  // This allows for efficient retrieval of all user properties via Mongoose's populate() method.
  properties: [{
    type: Schema.Types.ObjectId,
    ref: 'UserProperties'
  }]
  
  // Timestamps for when the user record was created and last updated.
  // Mongoose will manage these automatically.
}, {
  timestamps: true
});

// --- Mongoose Middleware (Hooks) ---

/**
 * Pre-save hook to hash the user's password before it's saved to the database.
 * This ensures that we never store plain-text passwords, a critical security measure.
 */
UserSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with a cost factor of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method to compare an incoming password with the stored hashed password.
 * @param {string} candidatePassword The plain-text password to compare.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// const User = mongoose.model('User', UserSchema);

module.exports = UserSchema;

