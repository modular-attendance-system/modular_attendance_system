// MAAS Engine: SessionConfigSchema.js
// Document Version: 1.0
// Author: Ritanshu Singh & Gemini

/**
 * @file Defines the Mongoose Sub-Schema for the Session Configuration object.
 * @description This schema defines the structure of the `attendant_config` object that is
 * embedded within the main Session model. It is the master blueprint for a session,
 * containing all the rules, module selections, and configurations defined by an
 * Attendant. This object serves as the primary input for the Session Decoder.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionConfigSchema = new Schema({
  // An array of propertyId strings that attendees must provide to participate
  // in this session. This allows for session-specific data collection.
  // e.g., ["prop_student_id", "prop_face_encodings"]
  requiredUserProperties: {
    type: [String],
    default: []
  },

  // An object representing the Shields activated for this session and their
  // specific configurations (including their "expected functions").
  // The keys are the moduleId of the Shield.
  activeShields: {
    type: Schema.Types.Mixed,
    default: {}
    /* Example:
      {
        "maas.shield.geolocation": { "expected_function": { ... } },
        "maas.shield.face_recognition": { "expected_function": { "mode": "strict" } }
      }
    */
  },

  // An object representing the Features activated for this session and their
  // specific configurations.
  // The keys are the moduleId of the Feature.
  activeFeatures: {
    type: Schema.Types.Mixed,
    default: {}
    /* Example:
      {
        "maas.feature.notification": { "notifyOn": "Suspicious" }
      }
    */
  },

  // The high-level rule for the Voting Aggregator. The Session Decoder will
  // compile this into a low-level, executable aggregator function.
  aggregatorRule: {
    type: Schema.Types.Mixed,
    required: true
    /* Example (Simple):
      {
        "logic": "AND",
        "shields": ["maas.shield.geolocation", "maas.shield.face_recognition"]
      }
       Example (Stateful/Sequential):
      {
        "logic": "STATE_MACHINE",
        "definition": { ... state machine JSON ... }
      }
    */
  }
}, {
  // This option prevents Mongoose from creating a separate _id for this sub-document.
  _id: false
});

module.exports = SessionConfigSchema;
