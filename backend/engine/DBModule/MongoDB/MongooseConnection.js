/**
 * @file MongooseConnection.js
 * @description A singleton class to manage the connection to the MongoDB database.
 * This module ensures that there is only one active connection across the entire
 * application, and it handles the connection lifecycle gracefully.
 */

const mongoose = require('mongoose');

class MongooseConnection {
    /** @private */
    static #instance = null;
    /** @private */
    #connection = null;

    /** @private */
    constructor() {
        if (MongooseConnection.#instance) {
            return MongooseConnection.#instance;
        }
        MongooseConnection.#instance = this;
    }

    static getInstance() {
        if (!MongooseConnection.#instance) {
            MongooseConnection.#instance = new MongooseConnection();
        }
        return MongooseConnection.#instance;
    }

    /**
     * Establishes a connection to the MongoDB database.
     * @param {string} connectionString - The MongoDB connection URI.
     */
    async connect(connectionString) {
        if (this.#connection) {
            console.log('[MongooseConnection] Connection already established.');
            return;
        }

        try {
            await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            this.#connection = mongoose.connection;
            
            this.#connection.on('error', (err) => {
                console.error('[MongooseConnection] MongoDB connection error:', err);
            });

            this.#connection.on('disconnected', () => {
                console.log('[MongooseConnection] MongoDB disconnected.');
            });

            console.log('[MongooseConnection] Successfully connected to MongoDB.');

        } catch (error) {
            console.error('[MongooseConnection] Could not connect to MongoDB:', error);
            process.exit(1); // Exit the process with a failure code if DB connection fails
        }
    }

    /**
     * Gracefully disconnects from the MongoDB database.
     */
    async disconnect() {
        if (this.#connection) {
            await this.#connection.close();
            this.#connection = null;
            console.log('[MongooseConnection] MongoDB connection closed.');
        }
    }
}

module.exports = { MongooseConnection };
