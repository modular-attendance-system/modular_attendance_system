/**
 * @file permission.js
 * @description Defines all CLI commands related to permission management for Features.
 */

const configurePermissionCommands = (program, engine) => {
    const permCommand = program.command('permission').description('Manage Feature permissions');

    permCommand
        .command('grant <moduleId> <permission>')
        .description('Grant a specific permission to a Feature')
        .action(async (moduleId, permission) => {
            await engine.grantPermission(moduleId, permission);
            console.log(`Permission '${permission}' granted to module ${moduleId}.`);
        });

    permCommand
        .command('revoke <moduleId> <permission>')
        .description('Revoke a specific permission from a Feature')
        .action(async (moduleId, permission) => {
            await engine.revokePermission(moduleId, permission);
            console.log(`Permission '${permission}' revoked from module ${moduleId}.`);
        });
};

module.exports = { configurePermissionCommands };

