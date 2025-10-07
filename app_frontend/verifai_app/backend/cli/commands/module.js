/**
 * @file module.js
 * @description Defines all CLI commands related to module management.
 */

const configureModuleCommands = (program, engine) => {
    const moduleCommand = program.command('module').description('Manage Shields and Features');

    moduleCommand
        .command('install <path>')
        .description('Install a new module from a path (placeholder)')
        .action(async (path) => {
            console.log(`Installing module from ${path}...`);
            // In a real implementation, this would involve:
            // 1. Unzipping the module package
            // 2. Reading and validating the manifest.json
            // 3. Calling engine.installShield or engine.installFeature
            // const manifest = readManifest(path);
            // await engine.installShield(manifest);
            console.log('Module installed successfully (simulated).');
        });

    moduleCommand
        .command('list')
        .description('List all installed modules')
        .option('-s, --status <status>', 'Filter by status (attached/detached)')
        .action(async (options) => {
            const modules = await engine.getInstalledModules(options);
            console.log('Installed Modules:');
            console.table(modules);
        });
        
    moduleCommand
        .command('status <moduleId> <status>')
        .description('Change a module\'s status (e.g., attached, detached)')
        .action(async (moduleId, status) => {
            await engine.updateModuleStatus(moduleId, status);
            console.log(`Module ${moduleId} status updated to ${status}.`);
        });
};

module.exports = { configureModuleCommands };

