/**
 * @file authenticated.router.js
 * @description Defines routes for any logged-in user.
 */
const express = require('express');

const createAuthenticatedUserRouter = ({ engine }) => {
    const router = express.Router();
    router.get('/v1/uimodules/manifest', (req, res) => {
        // In the future, this will come from the DB and the #hostedUiModules map.
        // For now, we hardcode our test module.
        const manifest = {
            'maas.module.session_decoder': {
                url: '/modules/dummy-decoder/remoteEntry.js', // The URL we created in Step 2
                name: 'sessionDecoderUI', // The name from the remote's webpack config
                module: './SessionDecoderPanel' // The module we exposed
            }
        };
        res.json(manifest);
    });
    router.get('/users/me', (req, res) => {
        res.json(req.user);
    });

    router.get('/sessions/my', async (req, res) => {
        const sessions = await engine.getSessionsForUser(req.user.userId);
        res.json(sessions);
    });

    router.get('/properties/available', async (req, res) => {
        const properties = await engine.getAvailableProperties();
        res.json(properties);
    });

    router.get('/modules/installed', async (req, res) => {
        const modules = await engine.getInstalledModules();
        res.json(modules);
    });

    return router;
};

module.exports = { createAuthenticatedUserRouter };

