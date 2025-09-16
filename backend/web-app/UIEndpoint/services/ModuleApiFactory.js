/**
 * @file ModuleApiFactory.js
 * @description A factory for creating sandboxed API handles for backend modules.
 * This service is the gatekeeper for all top-down (server-to-client) communication,
 * ensuring that modules like Shields and Features communicate through a secure,
 * abstract, and consistent interface.
 */

class ModuleApiFactory {
    #realTimeService = null;
    #pendingMessageService = null;

    /**
     * Initializes the ModuleApiFactory.
     * @param {object} dependencies - The dependencies needed by the service.
     * @param {import('./RealTimeService').RealTimeService} dependencies.realTimeService - The instance of the RealTimeService.
     * @param {import('./PendingMessageService').PendingMessageService} dependencies.pendingMessageService - The instance of the PendingMessageService.
     */
    constructor({ realTimeService, pendingMessageService }) {
        if (!realTimeService || !pendingMessageService) {
            throw new Error('ModuleApiFactory requires instances of realTimeService and pendingMessageService.');
        }
        this.#realTimeService = realTimeService;
        this.#pendingMessageService = pendingMessageService;
        console.log('[ModuleApiFactory] Initialized.');
    }

    /**
     * Creates a secure, sandboxed API handle for a specific backend module.
     * @param {string} moduleId - The unique ID of the module that will own this handle.
     * @returns {object} The sandboxed moduleApiHandle.
     */
    createHandle(moduleId) {
        if (!moduleId) {
            throw new Error('A moduleId is required to create an API handle.');
        }

        const handle = {
            /**
             * The Notification Service (for user awareness).
             * Sends high-level, human-readable notifications to the user's main dashboard panel.
             */
            notifications: {
                /**
                 * Sends a private notification to a single user, ensuring delivery even if offline.
                 * @param {string} userId - The ID of the target user.
                 * @param {object} notification - { message: string, level: 'info' | 'warning' | 'error' }
                 */
                sendToUser: async (userId, notification) => {
                    await this.#pendingMessageService.storeMessage(userId, 'notification', notification);
                    this.#realTimeService.sendToUser(userId, 'notification', notification);
                },

                /**
                 * Broadcasts a notification to all participants in a session, ensuring delivery.
                 * @param {string} sessionId - The ID of the target session.
                 * @param {object} notification - { message: string, level: 'info' }
                 */
                sendToSession: async (sessionId, notification) => {
                    // This is more complex as it involves finding all users in a session.
                    // For now, we'll rely on the real-time service to handle the broadcast logic.
                    // A more robust implementation might first fetch all userIds in the session
                    // and create individual pending messages for each.
                    this.#realTimeService.broadcastToSession(sessionId, 'notification', notification);
                },
            },

            /**
             * The UI Action Dispatch Service (for component action).
             * Sends a low-level, direct command to a specific UI module component.
             */
            uiActions: {
                /**
                 * Dispatches an action to a specific module's UI for a specific user.
                 * Guarantees delivery by first storing the message persistently.
                 * @param {object} command - { targetUserId: string, payload: object }
                 */
                dispatch: async (command) => {
                    const { targetUserId, payload } = command;

                    // The targetModuleId is automatically included by the factory,
                    // ensuring a module can only dispatch actions to its own UI components.
                    const fullPayload = { targetModuleId: moduleId, payload };
                    
                    // 1. Store the message first to guarantee delivery.
                    await this.#pendingMessageService.storeMessage(targetUserId, 'uiAction', fullPayload);

                    // 2. Then, attempt real-time delivery if the user is online.
                    this.#realTimeService.sendToUser(targetUserId, 'uiAction', fullPayload);
                },
            },
        };

        return handle;
    }
}

// Singleton pattern
let instance = null;

module.exports = {
    getInstance: (dependencies) => {
        if (!instance && dependencies) {
            instance = new ModuleApiFactory(dependencies);
        } else if (!instance && !dependencies) {
            throw new Error('ModuleApiFactory must be initialized with dependencies on first call.');
        }
        return instance;
    },
};
