/**
 * @file public.router.js
 * @description Defines routes for unauthenticated users.
 */
const express = require('express');
const path = require('path');

const createPublicRouter = ({ dbModule }) => {
    const engine = dbModule
    const router = express.Router();
    const reactAppBuildPath = path.join(__dirname, '..', '..', '..', 'client', 'build');

    const remotePath = path.join(__dirname, '../../../client/dummySessionDecoderUI/dist');
    router.use('/modules/dummy-decoder', express.static(remotePath));
    console.log('[PublicRouter] Now hosting dummy decoder UI for testing at /modules/dummy-decoder');

    router.post('/v1/auth/register', async (req, res) => {
   
        try {
            const result = await engine.registerUser(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.post('/v1/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await engine.authenticateUser(email, password);
            res.json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    });
    
    router.use(express.static(reactAppBuildPath));
    // router.get('*', (req, res) => {
    //     res.sendFile(path.join(reactAppBuildPath, 'index.html'));
    // });

    return router;
};

module.exports = { createPublicRouter };

