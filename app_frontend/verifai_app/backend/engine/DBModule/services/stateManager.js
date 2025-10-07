/**
 * @file stateManager.js
 * @description Handles session state records, state locks, and aggregated data fetching.
 */
const mongoose = require('mongoose');

class StateManager {
    constructor({ SessionStateRecordModel, SessionMembershipModel }) {
        this.SessionStateRecordModel = SessionStateRecordModel;
        this.SessionMembershipModel = SessionMembershipModel;
    }

    // --- State Record Management ---

    async getAttendeeStatus(userId, sessionId) {
        const membership = await this.SessionMembershipModel.findOne({ userId, sessionId }).lean();
        if (!membership) return null;
        
        return this.SessionStateRecordModel.findOne({ sessionId, provisionalId: membership.provisionalId })
            .sort({ createdAt: -1 })
            .lean();
    }
    
    async updateSessionState(sessionId, provisionalId, sourceModuleId, stateUpdate) {
        // We can add state lock checks here before updating
        const record = await this.SessionStateRecordModel.findOne({ sessionId, provisionalId });
        if (record && record.stateLock.isLocked && record.stateLock.lockedBy !== sourceModuleId) {
            // If it's the aggregator, just ignore the update silently.
            if (sourceModuleId === 'maas.engine.aggregator') {
                console.log(`[StateManager] Aggregator update for ${provisionalId} ignored due to state lock by ${record.stateLock.lockedBy}.`);
                return record.toObject();
            }
            // If it's a Resolver, throw an error to signal a conflict.
            throw new Error(`State Lock Violation: State for ${provisionalId} is locked by ${record.stateLock.lockedBy}.`);
        }
        
        return this.SessionStateRecordModel.findOneAndUpdate(
            { sessionId, provisionalId },
            { ...stateUpdate, lastUpdatedBy: sourceModuleId },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();
    }

    async getSessionStateHistory(sessionId, provisionalId, limit = 20) {
        return this.SessionStateRecordModel.find({ sessionId, provisionalId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }

    // --- State Lock Utilities ---

    async acquireStateLock(sessionId, provisionalId, sourceModuleId, durationSeconds = 60) {
        const expiresAt = new Date(Date.now() + durationSeconds * 1000);
        return this.SessionStateRecordModel.updateOne(
            { sessionId, provisionalId },
            { $set: { stateLock: { isLocked: true, lockedBy: sourceModuleId, expiresAt } } },
            { upsert: true }
        );
    }
    
    async releaseStateLock(sessionId, provisionalId, sourceModuleId) {
        // Only the module that acquired the lock can release it.
        return this.SessionStateRecordModel.updateOne(
            { sessionId, provisionalId, 'stateLock.lockedBy': sourceModuleId },
            { $set: { stateLock: { isLocked: false, lockedBy: null, expiresAt: null } } }
        );
    }

    // --- Aggregated Data Fetching ---

    async getAttendantDashboardData(sessionId) {
        const attendeeCount = await this.SessionMembershipModel.countDocuments({ sessionId, roles: 'attendee' });
        
        const statusCounts = await this.SessionStateRecordModel.aggregate([
            { $match: { sessionId: new mongoose.Types.ObjectId(sessionId) } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$provisionalId", latestState: { $first: "$currentState" } } },
            { $group: { _id: "$latestState", count: { $sum: 1 } } }
        ]);

        const recentEvents = await this.SessionStateRecordModel.find({ sessionId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return {
            attendeeCount,
            satisfiedCount: statusCounts.find(s => s._id === 'Satisfied')?.count || 0,
            recentEvents
        };
    }
}

module.exports = { StateManager };

