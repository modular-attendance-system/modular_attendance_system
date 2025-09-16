/**
 * @file attendant.router.js
 * @description Defines routes for users with the 'attendant' role in a session.
 */
const express = require('express');

const createAttendantRouter = ({ engine }) => {
    const router = express.Router();
    router.use('/',async (req, res, next)=>{
        let token = req.body.token;
        console.log(req.body);
        let user = await engine.verifyTokenAndGetUser(token);
        if(!user){
            res.status(400).json({error:"No user attached"});
            return;
        }
        req.user = user;
        next();
        
    });
    router.post('/sessions', async (req, res) => {
        try {
            const session = await engine.createSession(req.user.userId, req.body);
            res.status(201).json(session);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    router.get('/sessions/:sessionId', async (req, res) => {
        const session = await engine.getSessionById(req.params.sessionId);
        res.json(session);
    });
    
    router.get('/sessions/:sessionId/dashboard', async (req, res) => {
        const data = await engine.getAttendantDashboardData(req.params.sessionId);
        res.json(data);
    });

    return router;
};

module.exports = { createAttendantRouter };

