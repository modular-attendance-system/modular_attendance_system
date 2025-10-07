/**
 * @file SessionCompiledDataSchema.js
 * @description Defines the Mongoose sub-schema for the session_compiled_data object.
 * This is the low-level, machine-readable output of the Session Decoder.
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;
const ActivationBlockSchema = require('./ActivationBlockSchema');

const SessionCompiledDataSchema = new Schema({
    // The version of the compiled data format, for future compatibility.
    version: {
        type: String,
        required: true,
        default: '1.0'
    },
    // The complete, deterministic list of timed commands for the Scheduler.
    activation_blocks: {
        type: [ActivationBlockSchema],
        required: true,
        default: []
    },
    // The complete, deterministic logic for the Voting Aggregator.
    // Using Schema.Types.Mixed allows for simple logical rules or complex
    // state machine definitions to be stored.
    aggregator_function: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { _id: false });

module.exports = SessionCompiledDataSchema;
