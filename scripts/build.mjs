import { ensureDependencies, buildApp, buildStyles } from './toolchain.mjs';

ensureDependencies();
await buildApp();
buildStyles();
