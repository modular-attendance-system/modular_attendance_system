/**
 * @file maas-cli.js
 * @description The main entry point for the MAAS Command Line Interface.
 * It uses the 'commander' library to parse arguments and delegates tasks to
 * specific command modules. It initializes the central Engine to get access
 * to core services.
 */

const { Command } = require('commander');
const { Engine } = require('../engine/Engine');
const { configureModuleCommands } = require('./commands/module');
const { configurePermissionCommands } = require('./commands/permission');

const program = new Command();

async function main() {
    // Initialize the core engine to make its services available to commands
    const engine = Engine.getInstance();
    await engine.start();

    program
        .name('maas-cli')
        .description('Command Line Interface for managing the MAAS platform')
        .version('1.0.0');

    // Configure and attach command modules
    configureModuleCommands(program, engine);
    configurePermissionCommands(program, engine);
    
    await program.parseAsync(process.argv);
    
    // In a real CLI, you might want to disconnect from the DB gracefully
    // For simplicity here, we let the process exit.
}

main().catch(err => {
    console.error('CLI Error:', err.message);
    process.exit(1);
});

