#!/usr/bin/env node
// Runs the Cypress e2e suite locally across several `cypress run` processes. cypress-split
// (see cypress.config.mjs) gives each one its share of the specs, balanced by how long each spec
// took last time. CI doesn't use this: it splits the suite across GitLab `parallel:` jobs.
//
//   yarn test:e2e:parallel [--workers=N] [--clean-db] [any `cypress run` arguments]
//
// --workers defaults to 3, one per test user (see WORKER_USERNAMES in tests/cypress/support/auth.js).
// --clean-db first deletes every proposal from the local minikube database (scripts/cleanLocalDb.sh).
import { spawn, spawnSync } from 'node:child_process';
import { globSync, mkdirSync, rmSync } from 'node:fs';
import { createInterface } from 'node:readline';

const BIN = `${process.cwd()}/node_modules/.bin`;
const TIMINGS = 'scripts/cypress-timings.json';
const WORKER_TIMINGS = 'build/cypress-split';

const args = process.argv.slice(2);
const workersArg = args.find((arg) => arg.startsWith('--workers='));
const workers = Number(workersArg?.split('=')[1] ?? 3);
const cleanDb = args.includes('--clean-db');
const cypressArgs = ['run', ...args.filter((arg) => arg !== workersArg && arg !== '--clean-db')];

if (cleanDb && spawnSync('scripts/cleanLocalDb.sh', { stdio: 'inherit' }).status !== 0) {
  console.error('Could not clean the local database - not running the tests');
  process.exit(1);
}

// Without a display, Cypress starts its own Xvfb on :99, and concurrent workers would clash over it
const command =
  process.platform === 'linux' && !process.env.DISPLAY
    ? ['xvfb-run', '--auto-servernum', '--server-args=-screen 0 1280x1024x24', 'cypress']
    : ['cypress'];

const runWorker = (index) =>
  new Promise((resolve) => {
    // cypress-split writes SPLIT_OUTPUT_FILE but won't create its folder
    mkdirSync(`${WORKER_TIMINGS}/w${index}`, { recursive: true });
    const child = spawn(command[0], [...command.slice(1), ...cypressArgs], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PATH: `${BIN}:${process.env.PATH}`,
        FORCE_COLOR: process.stdout.isTTY ? '1' : '0',
        SPLIT: String(workers),
        SPLIT_INDEX: String(index),
        SPLIT_FILE: TIMINGS,
        // One file per worker so they don't overwrite each other - merged below
        SPLIT_OUTPUT_FILE: `${WORKER_TIMINGS}/w${index}/timings.json`
      }
    });
    for (const [stream, out] of [
      [child.stdout, process.stdout],
      [child.stderr, process.stderr]
    ]) {
      createInterface({ input: stream }).on('line', (line) => out.write(`[w${index}] ${line}\n`));
    }
    child.on('error', (error) => {
      console.error(`[w${index}] could not start ${command[0]}: ${error.message}`);
      resolve(1);
    });
    child.on('exit', (code) => resolve(code ?? 1));
  });

rmSync(WORKER_TIMINGS, { recursive: true, force: true });
const codes = await Promise.all(Array.from({ length: workers }, (_, index) => runWorker(index)));

// An empty timings file would unbalance the next split, so only merge when some worker wrote one
if (globSync(`${WORKER_TIMINGS}/*/timings.json`).length > 0) {
  spawnSync(
    `${BIN}/cypress-split-merge`,
    ['--parent-folder', WORKER_TIMINGS, '--split-file', 'timings.json', '--output', TIMINGS],
    { stdio: 'inherit' }
  );
}

const failed = codes.flatMap((code, index) => (code === 0 ? [] : [`w${index}`]));
console.log(failed.length ? `\nFailed: ${failed.join(', ')}` : '\nAll workers passed.');
process.exitCode = failed.length ? 1 : 0;
