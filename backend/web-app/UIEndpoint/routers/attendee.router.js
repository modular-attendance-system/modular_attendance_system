/**
 * @file attendee.router.js
 * @description Defines routes for users with the 'attendee' role in a session.
 */
const express = require('express');

const createAttendeeRouter = ({ engine }) => {
    const router = express.Router();

    router.get('/sessions/:sessionId/status', async (req, res) => {
        const status = await engine.getAttendeeStatus(req.user.userId, req.params.sessionId);
        res.json(status || { state: 'Not Applicable' });
    });

    router.post('/sessions/:sessionId/properties', async (req, res) => {
        // This is a simplified placeholder. In a real app, this logic would
        // be more complex, likely in the sessionManager.
        console.log('Saving properties for user', req.user.userId, 'in session', req.params.sessionId);
        res.json({ status: 'success' });
    });

    return router;
};

module.exports = { createAttendeeRouter };

