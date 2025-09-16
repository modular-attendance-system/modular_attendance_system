/**
 * @file server.js
 * @description The main entry point for the MAAS Web Application.
 * It initializes the central Engine core, prepares the UIEndpoint, creates the
 * ApiGateway, and wires them together to start the server.
 */

const { Engine } = require('../engine/Engine');
const  UIEndpoint  = require('./UIEndpoint/UIEndpoint');
const { ApiGateway } = require('./ApiGateway/ApiGateway');

const main = async () => {
    try {
        // 1. Initialize and start the shared core Engine
        const engine = Engine.getInstance();
        await engine.start();
        console.log('[Server] Core Engine started.');

        // 2. Initialize the UIEndpoint, which prepares all web-specific services
        const uiEndpoint = new UIEndpoint(engine);
        await uiEndpoint.start();
        console.log('[Server] UIEndpoint initialized.');

        // 3. Create the ApiGateway, passing it the routers from the UIEndpoint
        const apiGateway = new ApiGateway({
            routers: uiEndpoint.getRouters(),
        });
        console.log('[Server] ApiGateway created.');

        // 4. Start the web server via the ApiGateway
        const server = await apiGateway.start();
        console.log(`[Server] HTTP server listening on port ${server.address().port}`);
        
        // 5. Attach the running HTTP server to the real-time service
        const realTimeService = uiEndpoint.getRealTimeService();
        realTimeService.attachToServer(server);
        console.log('[Server] RealTimeService attached to server.');
        
        // 6. Final setup complete
        console.log('[Server] MAAS Web Application started successfully.');

    } catch (error) {
        console.error('A fatal error occurred during application startup:', error);
        process.exit(1);
    }
};

main();

