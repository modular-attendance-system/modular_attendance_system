/**
 * @file ApiGateway.js
 * @description Creates the main Express server and mounts all the role-based routers.
 */
const express = require('express');
const http = require('http');
const cors = require("cors");
class ApiGateway {
    #app;
    #routers;

    constructor({ routers }) {
        this.#app = express();
        this.#routers = routers;
        this.#app.use(cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
        }));
        this.#setupMiddleware();
        this.#setupRoutes();
    }

    #setupMiddleware() {
        console.log("This executed!");
        this.#app.use(express.json());
        // Add other global middleware like CORS, helmet, morgan here
    }

    #setupRoutes() {
        this.#app.use('/', this.#routers.publicRouter);
        this.#app.use('/api', this.#routers.authenticatedUserRouter);
        this.#app.use('/api/attendant', this.#routers.attendantRouter);
        this.#app.use('/api/attendee', this.#routers.attendeeRouter);
    }

    start() {
        return new Promise((resolve) => {
            const port = process.env.PORT || 4000;
            const server = http.createServer(this.#app);
            server.listen(port, () => {
                resolve(server);
            });
        });
    }
}

module.exports = { ApiGateway };
