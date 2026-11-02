import { spawn } from 'node:child_process';
import { ensureDependencies, buildApp, buildStyles, stylesCommand, env, root } from './toolchain.mjs';

ensureDependencies();
buildStyles();
const context = await buildApp(true);
const css = spawn(process.execPath, [...stylesCommand(), '--watch=always'], { env, stdio: 'inherit', cwd: root });
const { server } = await import('../server.mjs');
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  css.kill();
  await context.dispose();
  server.close(() => process.exit(0));
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
css.on('exit', code => { if (!stopping && code) { console.error('Tailwind watcher exited.'); stop(); } });
