/**
 * @file sessionManager.js
 * @description Handles all logic related to sessions and session memberships.
 */
const mongoose = require('mongoose');

class SessionManager {
    constructor({ SessionModel, SessionMembershipModel }) {
        if (!SessionModel || !SessionMembershipModel) {
            throw new Error("SessionModel and SessionMembershipModel are required.");
        }
        this.SessionModel = SessionModel;
        this.SessionMembershipModel = SessionMembershipModel;
    }

    // --- Session CRUD ---

    async createSession(attendantUserId, sessionData) {
        const session = new this.SessionModel(sessionData);
        await session.save();

        const membership = await this.addMemberToSession(session._id, attendantUserId, ['attendant']);
        
        session.attendants.push(membership._id);
        await session.save();
        
        return session.toObject();
    }

    async getSessionById(sessionId) {
        return this.SessionModel.findById(sessionId).populate('attendants').lean();
    }
    
    async updateSession(sessionId, updateData) {
        // For example, changing the name or the attendant_config
        return this.SessionModel.findByIdAndUpdate(sessionId, { $set: updateData }, { new: true }).lean();
    }
    
    async deleteSession(sessionId) {
        // This is a cascading delete, a critical operation.
        await this.SessionMembershipModel.deleteMany({ sessionId });
        // TODO: Also delete SessionStateRecords for this session.
        return this.SessionModel.findByIdAndDelete(sessionId);
    }
    
    async getActiveSessions() {
        return this.SessionModel.find({ status: 'active' }).lean();
    }

    // --- Membership Management ---

    async addMemberToSession(sessionId, userId, roles = ['attendee']) {
         const existingMembership = await this.SessionMembershipModel.findOne({ sessionId, userId });
        if (existingMembership) {
            // If user is already a member, update their roles
            const newRoles = [...new Set([...existingMembership.roles, ...roles])];
            existingMembership.roles = newRoles;
            await existingMembership.save();
            return existingMembership.toObject();
        }
        
        return this.SessionMembershipModel.create({
            sessionId,
            userId,
            roles,
            provisionalId: new mongoose.Types.ObjectId().toString()
        });
    }

    async removeMemberFromSession(sessionId, userId) {
        return this.SessionMembershipModel.deleteOne({ sessionId, userId });
    }

    async getMembersForSession(sessionId, roleFilter = null) {
        const query = { sessionId };
        if (roleFilter) {
            query.roles = roleFilter; // e.g., 'attendee' or 'attendant'
        }
        return this.SessionMembershipModel.find(query).populate('userId', 'name email').lean();
    }

    async getSessionsForUser(userId) {
        const memberships = await this.SessionMembershipModel.find({ userId }).lean();
        if (memberships.length === 0) return [];

        const sessionIds = memberships.map(m => m.sessionId);
        const sessions = await this.SessionModel.find({ _id: { $in: sessionIds } }).lean();
        
        return sessions.map(session => {
            const membership = memberships.find(m => m.sessionId.toString() === session._id.toString());
            return {
                sessionId: session._id,
                name: session.name,
                roles: membership.roles,
                status: session.status
            };
        });
    }

    // --- Role Verification ---

    async isUserAttendantForSession(userId, sessionId) {
        const membership = await this.SessionMembershipModel.findOne({ userId, sessionId });
        return membership?.roles?.includes('attendant') ?? false;
    }

    async isUserAttendeeForSession(userId, sessionId) {
        const membership = await this.SessionMembershipModel.findOne({ userId, sessionId });
        return membership?.roles?.includes('attendee') ?? false;
    }
}

module.exports = { SessionManager };

