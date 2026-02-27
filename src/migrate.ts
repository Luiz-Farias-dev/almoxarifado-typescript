import { umzug } from './config/umzug';

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'up':
      await umzug.up();
      break;
    case 'down':
      await umzug.down();
      break;
    case 'status': {
      const pending = await umzug.pending();
      const executed = await umzug.executed();
      console.log('Executed migrations:');
      executed.forEach((m) => console.log('  ✔', m.name));
      console.log('Pending migrations:');
      pending.forEach((m) => console.log('  ○', m.name));
      break;
    }
    default:
      console.error(`Unknown command: "${command}". Use: up | down | status`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
