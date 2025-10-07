/**
 * @file UIEndpoint.js
 * @description The master initialization and orchestration module for the MAAS Engine.
 * It is the application's entry point, responsible for bootstrapping all services,
 * creating the role-based routers, and handing control to the ApiGateway to run the server.
 */

const { ApiGateway } = require('../ApiGateway/ApiGateway');
const { MongooseConnection } = require('../../engine/DBModule/MongoDB/MongooseConnection');
const { DBModule } = require('../../engine/DBModule/DBModule');

// Import the core services
const { getInstance: getRealTimeService } = require('./services/RealTimeService');
const { getInstance: getPendingMessageService } = require('./services/PendingMessageService');
const { getInstance: getModuleApiFactory } = require('./services/ModuleApiFactory');

// Import the router factories
const { createPublicRouter } = require('./routers/public.router');
const { createAuthenticatedUserRouter } = require('./routers/authenticated.router');
const { createAttendantRouter } = require('./routers/attendant.router');
const { createAttendeeRouter } = require('./routers/attendee.router');


class UIEndpoint {
    #hostedUiModules = new Map();
    static #engine
    static #uiEndpoint
    #routers
    #realTmSrvc
    constructor(engine) {
        if(!engine){
            throw new Error("Giv eme engine, I am UI endpoint");
        }
        UIEndpoint.#engine = engine;
        if(UIEndpoint.#uiEndpoint){
            return UIEndpoint.#uiEndpoint
        }
        UIEndpoint.#uiEndpoint = this;
        return this;
    }

    async start() {
        console.log('[UIEndpoint] Bootstrapping all MAAS Engine modules...');

        try {
            // --- 1. Initialize Core Infrastructure ---
            await MongooseConnection.getInstance().connect('mongodb+srv://mrrit:90Ko2tvLFxtNrAGJ@maindb.ocvso.mongodb.net/?retryWrites=true&w=majority&appName=MainDB');
            const dbModule = DBModule.getInstance();
            // TODO: Initialize other core engine modules like ModuleRegistry, Scheduler, etc.
            const moduleRegistry = {}; // Placeholder

            // --- 2. Initialize UI Engine's Internal Services ---
            const realTimeService = getRealTimeService({engine:UIEndpoint.#engine});
            this.#realTmSrvc = realTimeService
            const pendingMessageService = getPendingMessageService({ dbModule });
            const moduleApiFactory = getModuleApiFactory({ realTimeService, pendingMessageService });

            // --- 3. Create the four distinct routers ---
            const routers = {
                publicRouter: createPublicRouter({ dbModule }),
                authenticatedUserRouter: createAuthenticatedUserRouter({ engine:dbModule }),
                attendantRouter: createAttendantRouter({ engine:dbModule }),
                attendeeRouter: createAttendeeRouter({ dbModule })
            };
            this.#routers = routers;
            console.log('[UIEndpoint] All role-based routers created.');

            // --- 4. Instantiate and start the ApiGateway ---
            // const apiGateway = new ApiGateway({
            //     routers: routers,
            //     dbModule: dbModule,
            // });

            // console.log('[UIEndpoint] Handing off control to the ApiGateway...');
            // const server = await apiGateway.start();
            
            // --- 5. Attach Real-Time Service to the running server ---
            // realTimeService.attachToServer(server);

            // --- 6. Resume active sessions (placeholder for now) ---
            await this.#resumeActiveSessions({ dbModule, moduleRegistry, routers });

        } catch (error) {
            console.error('[UIEndpoint] A fatal error occurred during the boot sequence:', error);
            process.exit(1);
        }
    }

    async #resumeActiveSessions({ dbModule, moduleRegistry, routers }) {
        console.log('[UIEndpoint] Checking for active sessions to resume...');
        // Placeholder logic
    }
    getRouters(){
        return this.#routers
    }
    getRealTimeService(){
        return this.#realTmSrvc
    }
}

// --- Application Entry Point ---
// (async () => {
//     const uiEndpoint = new UIEndpoint();
//     await uiEndpoint.start();
// })();
module.exports = UIEndpoint