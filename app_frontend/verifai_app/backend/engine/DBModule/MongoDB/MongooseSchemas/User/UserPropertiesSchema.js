// MAAS Engine: UserPropertiesSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Schema for the decoupled User Properties model.
 * @description This schema is the cornerstone of the flexible user data architecture. It
 * allows for storing arbitrary, extensible key-value data for each user, keeping the
 * core User model lean. A Shield or Feature can declare a dependency on a 'propertyId',
 * and the system can then prompt users to provide the necessary data for this model
 * on a per-session basis.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserPropertiesSchema = new Schema({
  // A direct reference to the core User document this property belongs to.
  // This is the foreign key linking this property back to a specific user.
  // It is indexed for efficient lookups of all properties for a given user.
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // The unique identifier for the property (the "key").
  // This should match the 'propertyId' defined in a Shield's or Feature's manifest.
  // e.g., "prop_tshirt_size", "prop_face_encodings", "prop_dietary_restrictions"
  propertyId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  // The actual data for the property (the "value").
  // 'Schema.Types.Mixed' allows this field to store any valid JSON structure,
  // from a simple string or number to a complex nested object or array.
  // This provides the flexibility required for diverse Shield and Feature needs.
  value: {
    type: Schema.Types.Mixed,
    required: true
  },

  // Timestamps for when this specific property was created and last updated.
}, {
  timestamps: true
});

// --- Compound Index ---

/**
 * Creates a compound unique index on `userId` and `propertyId`.
 * This is a critical data integrity constraint. It ensures that a single user
 * cannot have more than one document for the same property. For example, a user
 * can only have one "prop_tshirt_size". To change it, the existing document
 * must be updated, not a new one created.
 */
UserPropertiesSchema.index({ userId: 1, propertyId: 1 }, { unique: true });


// const UserProperties = mongoose.model('UserProperties', UserPropertiesSchema);

module.exports = UserPropertiesSchema;
