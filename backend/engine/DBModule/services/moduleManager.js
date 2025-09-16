/**
 * @file moduleManager.js
 * @description Handles all logic for installing, managing, and querying modules and properties.
 */

class ModuleManager {
    constructor({ InstalledShieldModel, InstalledFeatureModel, UserPropertiesModel }) {
        this.InstalledShieldModel = InstalledShieldModel;
        this.InstalledFeatureModel = InstalledFeatureModel;
        this.UserPropertiesModel = UserPropertiesModel;
    }

    // --- Module Installation & Management (for CLI) ---

    async installShield(manifestData) {
        return this.InstalledShieldModel.findOneAndUpdate(
            { moduleId: manifestData.id },
            {
                moduleId: manifestData.id,
                version: manifestData.version,
                status: 'attached',
                manifestData: manifestData
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
    }

    async installFeature(manifestData) {
         return this.InstalledFeatureModel.findOneAndUpdate(
            { moduleId: manifestData.id },
            {
                moduleId: manifestData.id,
                version: manifestData.version,
                status: 'attached',
                manifestData: manifestData,
                // On initial install, permissions are requested but not granted.
                permissions: manifestData.permissions.map(p => ({ name: p, isGranted: false }))
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();
    }

    async uninstallModule(moduleId) {
        // Atomically try to delete from both collections
        await this.InstalledShieldModel.deleteOne({ moduleId });
        await this.InstalledFeatureModel.deleteOne({ moduleId });
        return { status: 'ok', message: `Uninstalled module ${moduleId}` };
    }

    async updateModuleStatus(moduleId, status) {
        if (!['attached', 'detached'].includes(status)) {
            throw new Error('Invalid module status.');
        }
        const shieldUpdate = this.InstalledShieldModel.updateOne({ moduleId }, { $set: { status } });
        const featureUpdate = this.InstalledFeatureModel.updateOne({ moduleId }, { $set: { status } });
        await Promise.all([shieldUpdate, featureUpdate]);
        return { status: 'ok', message: `Set status of ${moduleId} to ${status}` };
    }

    async grantPermission(moduleId, permissionName) {
        return this.InstalledFeatureModel.updateOne(
            { moduleId, 'permissions.name': permissionName },
            { $set: { 'permissions.$.isGranted': true } }
        );
    }
    
    async revokePermission(moduleId, permissionName) {
         return this.InstalledFeatureModel.updateOne(
            { moduleId, 'permissions.name': permissionName },
            { $set: { 'permissions.$.isGranted': false } }
        );
    }


    // --- Module & Property Querying (for Engine/UI) ---

    async getAvailableProperties() {
        return this.UserPropertiesModel.find({}).lean();
    }

    async getInstalledModules(filter = {}) {
        const shields = await this.InstalledShieldModel.find(filter).lean();
        const features = await this.InstalledFeatureModel.find(filter).lean();
        return { shields, features };
    }

    async getModuleById(moduleId) {
        let module = await this.InstalledShieldModel.findOne({ moduleId }).lean();
        if (module) return module;
        return this.InstalledFeatureModel.findOne({ moduleId }).lean();
    }
}

module.exports = { ModuleManager };

