/**
 * @file ActivationBlockSchema.js
 * @description Defines the Mongoose sub-schema for a single activation block.
 * This is a deterministic, timed command instruction for the Scheduler.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ActivationBlockSchema = new Schema({
    // A unique identifier for this specific block within the session.
    blockId: {
        type: String,
        required: true
    },
    // The unique ID of the Shield Server that this command targets.
    targetShieldId: {
        type: String,
        required: true,
        index: true
    },
    // The time window during which this activation block is valid.
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    // The specific, versioned command payload to be sent to the Shield Server.
    // Using Schema.Types.Mixed provides the flexibility to accommodate any
    // command structure defined by any Shield.
    commandPayload: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { _id: false }); // Sub-documents don't need their own _id

module.exports = ActivationBlockSchema;
