/**
 * @file DBModule.js
 * @description The definitive DB Module for the MAAS Engine.
 * This module acts as an orchestrator, assembling specialized service managers
 * to provide a unified, high-level API for all database operations. It also
 * manages core security features like the permission registry and scoped handles.
 */

const mongoose = require('mongoose');
const { UserManager } = require('./services/userManager');
const { SessionManager } = require('./services/sessionManager');
const { ModuleManager } = require('./services/moduleManager');
const { StateManager } = require('./services/stateManager');

// --- Helper Class: The Scoped Handle (for Module Data Isolation) ---
// This class provides a sandboxed interface for modules to interact with the database.
class ScopedDBHandle {
    /** @private @type {string} */
    #moduleId;
    /** @private @type {DBModule} */
    #dbModuleInstance;

    constructor(moduleId, dbModuleInstance) {
        this.#moduleId = moduleId;
        this.#dbModuleInstance = dbModuleInstance;
    }

    /**
     * Creates a new private model for the module, sandboxed by this handle.
     * The model name is automatically prefixed with the module's ID to ensure uniqueness.
     * @param {string} modelName - A name for the model, unique to this module.
     * @param {mongoose.Schema} schema - The Mongoose schema for the model.
     * @returns {import('mongoose').Model}
     */
    getOrCreateModel(modelName, schema) {
        const sandboxedModelName = `${this.#moduleId}_${modelName.replace(/ /g, '_')}`;
        return this.#dbModuleInstance.getOrCreateModel(sandboxedModelName, schema);
    }
}


// --- Main Module Class ---
class DBModule {
    /** @private */
    static #instance = null;
    /** @private */
    #permissionsRegistry = new Map();
    /** @private */
    #services = {};
    /** @private */
    #models = {};

    /** @private */
    constructor() {
        if (DBModule.#instance) return DBModule.#instance;
        console.log('[DBModule] Initialized.');
        DBModule.#instance = this;
    }

    static getInstance() {
        if (!DBModule.#instance) {
            DBModule.#instance = new DBModule();
        }
        return DBModule.#instance;
    }

    /**
     * Connects to the database, initializes all core Mongoose models,
     * and assembles the specialized service managers.
     * @param {string} connectionString
     */
    async connect(connectionString) {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(connectionString);
            console.log('[DBModule] Connected to MongoDB.');
        }

        // Initialize core models required by the services
        this.#models = {
            User: this.getOrCreateModel('User', require('./MongoDB/MongooseSchemas/User/UserSchema')),
            UserProperties: this.getOrCreateModel('UserProperty', require('./MongoDB/MongooseSchemas/User/UserPropertiesSchema')),
            Session: this.getOrCreateModel('Session', require('./MongoDB/MongooseSchemas/Session/SessionSchema')),
            SessionMembership: this.getOrCreateModel('SessionMembership', require('./MongoDB/MongooseSchemas/Session/SessionMembershipSchema')),
            SessionStateRecord: this.getOrCreateModel('SessionStateRecord', require('./MongoDB/MongooseSchemas/StateRecord/SessionStateRecordSchema')),
            InstalledShield: this.getOrCreateModel('InstalledShield', require('./MongoDB/MongooseSchemas/ModuleRegistry/InstalledShieldSchema')),
            InstalledFeature: this.getOrCreateModel('InstalledFeature', require('./MongoDB/MongooseSchemas/ModuleRegistry/InstalledFeatureSchema')),
        };

        // Instantiate and assemble all service managers
        this.#services.user = new UserManager({ UserModel: this.#models.User, UserPropertiesModel: this.#models.UserProperties });
        this.#services.session = new SessionManager({ SessionModel: this.#models.Session, SessionMembershipModel: this.#models.SessionMembership });
        this.#services.module = new ModuleManager({ 
            InstalledShieldModel: this.#models.InstalledShield, 
            InstalledFeatureModel: this.#models.InstalledFeature
        });
        this.#services.state = new StateManager({ SessionStateRecordModel: this.#models.SessionStateRecord, SessionMembershipModel: this.#models.SessionMembership });
        
        console.log('[DBModule] All data services initialized.');
        // Load permissions into the cache after services are ready
        await this.loadPermissions();
    }

    /**
     * Loads all granted permissions from the database into an in-memory
     * cache for fast, synchronous lookups during critical operations.
     */
    async loadPermissions() {
        this.#permissionsRegistry.clear();
        const { features } = await this.#services.module.getInstalledModules({ status: 'attached' });
        for (const feature of features) {
            if (feature.permissions && feature.moduleId) {
               const grantedPermissions = new Set(
                   feature.permissions.filter(p => p.isGranted).map(p => p.name)
               );
               this.#permissionsRegistry.set(feature.moduleId, grantedPermissions);
            }
        }
        console.log('[DBModule] Feature permissions reloaded into registry.');
    }

    /**
     * A secure model factory that prevents Mongoose model re-compilation errors.
     * @private
     */
    getOrCreateModel(modelName, schema) {
        if (mongoose.models[modelName]) {
            return mongoose.models[modelName];
        }
        return mongoose.model(modelName, schema);
    }

    /**
     * Factory method to create a secure, sandboxed DB handle for a module.
     * @param {string} moduleId - The unique ID of the module requesting the handle.
     * @returns {ScopedDBHandle}
     */
    getScopedHandle(moduleId) {
        if (!moduleId) throw new Error('moduleId is required to create a scoped handle.');
        return new ScopedDBHandle(moduleId, this);
    }

    // --- High-Level API Facade ---
    // The public methods now act as a clean facade, delegating to the specialized services.

    // [User & Auth Management]
    registerUser = (userData) => this.#services.user.registerUser(userData);
    authenticateUser = (email, pass) => this.#services.user.authenticateUser(email, pass);
    verifyTokenAndGetUser = (token) => this.#services.user.verifyTokenAndGetUser(token);
    getUserById = (userId) => this.#services.user.getUserById(userId);
    assignPropertyToUser = (userId, propId, data) => this.#services.user.assignPropertyToUser(userId, propId, data);
    
    // [Session & Membership Management]
    createSession = (userId, data) => this.#services.session.createSession(userId, data);
    updateSession = (sessionId, data) => this.#services.session.updateSession(sessionId, data);
    getActiveSessions = () => this.#services.session.getActiveSessions();
    getSessionsForUser = (userId) => this.#services.session.getSessionsForUser(userId);
    getSessionById = (sessionId) => this.#services.session.getSessionById(sessionId);
    addMemberToSession = (sessionId, userId, roles) => this.#services.session.addMemberToSession(sessionId, userId, roles);
    getMembersForSession = (sessionId, role) => this.#services.session.getMembersForSession(sessionId, role);
    isUserAttendantForSession = (userId, sessionId) => this.#services.session.isUserAttendantForSession(userId, sessionId);
    isUserAttendeeForSession = (userId, sessionId) => this.#services.session.isUserAttendeeForSession(userId, sessionId);

    // [Module & Property Management]
    installShield = (manifest) => this.#services.module.installShield(manifest);
    installFeature = (manifest) => this.#services.module.installFeature(manifest);
    uninstallModule = (moduleId) => this.#services.module.uninstallModule(moduleId);
    updateModuleStatus = (moduleId, status) => this.#services.module.updateModuleStatus(moduleId, status);
    grantPermission = (moduleId, perm) => this.#services.module.grantPermission(moduleId, perm);
    revokePermission = (moduleId, perm) => this.#services.module.revokePermission(moduleId, perm);
    getAvailableProperties = () => this.#services.module.getAvailableProperties();
    getInstalledModules = (filter) => this.#services.module.getInstalledModules(filter);
    getModuleById = (moduleId) => this.#services.module.getModuleById(moduleId);
    
    // [State & Data Management]
    getAttendeeStatus = (userId, sessionId) => this.#services.state.getAttendeeStatus(userId, sessionId);
    getAttendantDashboardData = (sessionId) => this.#services.state.getAttendantDashboardData(sessionId);
    acquireStateLock = (sid, pid, mid, duration) => this.#services.state.acquireStateLock(sid, pid, mid, duration);
    releaseStateLock = (sid, pid, mid) => this.#services.state.releaseStateLock(sid, pid, mid);

    /**
     * The authoritative method to update state, performing a crucial permission check
     * before delegating the operation to the state manager.
     */
    async updateSessionState(sourceModuleId, sessionId, provisionalId, stateUpdate) {
        const isAggregator = sourceModuleId === 'maas.engine.aggregator';
        const hasPermission = this.#permissionsRegistry.get(sourceModuleId)?.has('engine.state.update');

        if (!isAggregator && !hasPermission) {
            throw new Error(`Security Violation: Module "${sourceModuleId}" lacks 'engine.state.update' permission.`);
        }
        
        return this.#services.state.updateSessionState(sessionId, provisionalId, sourceModuleId, stateUpdate);
    }
}

module.exports = { DBModule };

