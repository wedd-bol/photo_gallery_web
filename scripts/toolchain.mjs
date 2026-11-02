import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
const dataRoot = process.env.CODEX_DATA_ROOT || 'F:/CodexData';
export const toolRoot = path.join(dataRoot, 'dependency-cache', 'photo-gallery-react');
export const tempRoot = path.join(dataRoot, 'temp', 'photo_gallery_web');
export const env = { ...process.env, TEMP: tempRoot, TMP: tempRoot, TMPDIR: tempRoot, npm_config_cache: path.join(dataRoot, 'dependency-cache', 'npm') };
const packages = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

export function ensureDependencies() {
  mkdirSync(tempRoot, { recursive: true });
  const dependencies = { ...packages.dependencies, ...packages.devDependencies };
  const ready = Object.entries(dependencies).every(([name, version]) => {
    const manifest = path.join(toolRoot, 'node_modules', name, 'package.json');
    return existsSync(manifest) && JSON.parse(readFileSync(manifest, 'utf8')).version === version;
  });
  if (ready) return;
  const args = ['install', '--prefix', toolRoot, ...Object.entries(dependencies).map(([name, version]) => `${name}@${version}`), '--no-audit', '--no-fund', '--package-lock=false'];
  const npmCli = process.env.npm_execpath;
  if (process.platform === 'win32' && !npmCli) throw new Error('首次运行请使用 npm run build 或 npm run dev。');
  const install = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], { env, stdio: 'inherit', cwd: tempRoot })
    : spawnSync('npm', args, { env, stdio: 'inherit', cwd: tempRoot });
  if (install.status !== 0) throw new Error('外部依赖安装失败。');
}

export async function buildApp(watch = false) {
  const require = createRequire(path.join(toolRoot, 'package.json'));
  const esbuild = require('esbuild');
  const options = {
    absWorkingDir: root, entryPoints: ['src/main.jsx'], outfile: 'assets/app.js',
    bundle: true, minify: true, format: 'esm', platform: 'browser', target: 'es2022',
    jsx: 'automatic', nodePaths: [path.join(toolRoot, 'node_modules')],
    define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'linked',
    logLevel: 'info',
  };
  if (!watch) return esbuild.build(options);
  const context = await esbuild.context(options);
  await context.rebuild();
  await context.watch();
  return context;
}

export function stylesCommand() {
  const cssPath = value => value.replaceAll('\\', '/');
  const input = readFileSync(path.join(root, 'tailwind.input.css'), 'utf8')
    .replace('"tailwindcss"', `"${cssPath(path.join(toolRoot, 'node_modules', 'tailwindcss', 'index.css'))}"`)
    .replaceAll('@source "./', `@source "${cssPath(root)}`);
  // Isolate the watched CSS input from browser profiles and QA screenshots.
  const buildTemp = path.join(tempRoot, 'build');
  mkdirSync(buildTemp, { recursive: true });
  const generatedInput = path.join(buildTemp, 'tailwind.generated.css');
  writeFileSync(generatedInput, input);
  return [path.join(toolRoot, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs'), '-i', generatedInput, '-o', path.join(root, 'assets', 'tailwind.css'), '--minify'];
}

export function buildStyles() {
  const result = spawnSync(process.execPath, stylesCommand(), { env, stdio: 'inherit', cwd: root });
  if (result.status !== 0) throw new Error('Tailwind 样式构建失败。');
}
