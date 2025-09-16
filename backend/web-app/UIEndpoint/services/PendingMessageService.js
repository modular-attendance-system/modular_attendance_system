/**
 * @file PendingMessageService.js
 * @description Implements the persistent "store-and-forward" messaging system.
 * This service defines its own data schema and uses the DBModule to create a
 * private, dedicated Mongoose model for managing its "mailbox" collection,
 * ensuring complete data isolation.
 */

const mongoose = require('mongoose');

// 1. Define the private schema for this service's data.
const PendingMessageSchema = new mongoose.Schema({
    targetUserId: { type: String, required: true, index: true },
    messageType: { type: String, required: true, enum: ['notification', 'uiAction'] },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, required: true, default: 'pending', enum: ['pending', 'delivered'] },
    createdAt: { type: Date, default: Date.now, expires: '7d' } // Auto-delete messages after 7 days
}, { timestamps: true });


class PendingMessageService {
    #dbModule = null;
    /** @private @type {import('mongoose').Model} */
    #PendingMessageModel = null;

    /**
     * Initializes the PendingMessageService.
     * @param {object} dependencies - The dependencies needed by the service.
     * @param {import('../../../DBModule/DBModule').DBModule} dependencies.dbModule - The instance of the DBModule.
     */
    constructor({ dbModule }) {
        if (!dbModule) {
            throw new Error('PendingMessageService requires a dbModule instance.');
        }
        this.#dbModule = dbModule;

        // 2. Use the DBModule to register and get our private model.
        // We assume the DBModule has a method to handle this, which prevents model re-compilation errors.
        this.#PendingMessageModel = this.#dbModule.getOrCreateModel('UIEngine_PendingMessage', PendingMessageSchema);
        
        console.log('[PendingMessageService] Initialized and registered its private data model.');
    }

    /**
     * Stores a message in the service's private collection.
     * @param {string} targetUserId
     * @param {'notification' | 'uiAction'} messageType
     * @param {object} payload
     * @returns {Promise<object>}
     */
    async storeMessage(targetUserId, messageType, payload) {
        if (!targetUserId || !messageType || !payload) {
            throw new Error('Missing required parameters for storing a message.');
        }
        try {
            // 3. Use the private model for all DB operations.
            return this.#PendingMessageModel.create({
                targetUserId,
                messageType,
                payload,
            });
        } catch (error) {
            console.error(`[PendingMessageService] Failed to store message for user ${targetUserId}:`, error);
            throw error;
        }
    }

    /**
     * Fetches all pending messages for a user from the private collection.
     * @param {string} userId
     * @returns {Promise<Array<object>>}
     */
    async fetchAndClearPendingMessages(userId) {
        if (!userId) return [];

        try {
            const messages = await this.#PendingMessageModel.find({
                targetUserId: userId,
                status: 'pending',
            }).sort({ createdAt: 1 });

            if (messages.length === 0) return [];

            const messageIds = messages.map(msg => msg._id);

            await this.#PendingMessageModel.updateMany(
                { _id: { $in: messageIds } },
                { $set: { status: 'delivered' } }
            );

            console.log(`[PendingMessageService] Fetched and cleared ${messages.length} message(s) for user ${userId}.`);
            // Return the plain JS objects, not the Mongoose documents
            return messages.map(msg => msg.toObject());
        } catch (error) {
            console.error(`[PendingMessageService] Failed to fetch pending messages for user ${userId}:`, error);
            return [];
        }
    }
}

// Singleton pattern
let instance = null;
module.exports = {
    getInstance: (dependencies) => {
        if (!instance && dependencies) {
            instance = new PendingMessageService(dependencies);
        } else if (!instance && !dependencies) {
            throw new Error('PendingMessageService must be initialized with dependencies on first call.');
        }
        return instance;
    },
};

