/**
 * @file RealTimeService.js
 * @description Manages all real-time client communication using Socket.IO.
 * It handles connection authentication, room management, and broadcasting.
 */

const { Server } = require('socket.io');

class RealTimeService {
    #io = null;
    #engine = null;

    constructor({ engine }) {
        if (!engine) {
            throw new Error('RealTimeService requires an engine instance.');
        }
        this.#engine = engine;
        console.log('[RealTimeService] Initialized.');
    }

    attachToServer(httpServer) {
        this.#io = new Server(httpServer, {
            cors: {
                origin: "*", // Configure for production
                methods: ["GET", "POST"]
            }
        });

        this.#io.on('connection', (socket) => this.#handleConnection(socket));
        console.log('[RealTimeService] Attached to HTTP server and listening for connections.');
    }

    async #handleConnection(socket) {
        const token = socket.handshake.auth.token;
        console.log(token)
        const user = await this.#engine.verifyTokenAndGetUser(token);
        console.log(" Some one there");
        console.log(user);
        if (!user) {
            socket.emit('error', 'Authentication failed.');
            socket.disconnect();
            console.log("Hha, tricked ya");
            return;
        }

        console.log(`[RealTimeService] User connected: ${user.email} (Socket ID: ${socket.id})`);
        socket.join(`user:${user.userId}`);
        const userSessions = await this.#engine.getSessionsForUser(user.userId);
        userSessions.forEach(session => socket.join(`session:${session.sessionId}`));
        
        socket.on('disconnect', () => {
            console.log(`[RealTimeService] User disconnected: ${user.email}`);
        });
    }

    sendToUser(userId, event, payload) {
        this.#io.to(`user:${userId}`).emit(event, payload);
    }

    broadcastToSession(sessionId, event, payload) {
        this.#io.to(`session:${sessionId}`).emit(event, payload);
    }
}

let instance = null;
module.exports = {
    getInstance: (dependencies) => {
        if (!instance) {
            instance = new RealTimeService(dependencies);
        }
        return instance;
    }
};

