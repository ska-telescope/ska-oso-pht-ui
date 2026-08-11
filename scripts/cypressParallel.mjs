#!/usr/bin/env node
// Runs the Cypress e2e suite across several concurrent `cypress run` processes instead of one,
// each covering a subset of spec files. Cypress itself only parallelises across *separate CI
// machines* via Cypress Cloud's --record --parallel (see cypress.config.mjs's projectId) - this
// script gets most of the same wall-clock win on a single machine, with no cloud dependency, so
// it works the same way locally and in CI.
//
// Usage:
//   node scripts/cypressParallel.mjs [--workers=N] [--dry-run] [<extra args passed to each `cypress run`>]
//   CYPRESS_PARALLEL_WORKERS=4 node scripts/cypressParallel.mjs
//
// Any argument this script doesn't recognise is forwarded to every `cypress run` worker
// unchanged (no `--` separator needed) - this matters because CI's Makefile-driven invocation
// (see JS_E2E_TEST_COMMAND/JS_E2E_TEST_DEFAULT_SWITCHES in .make/js.mk) appends its own switches
// directly with no separator, e.g. `node scripts/cypressParallel.mjs --headless --reporter junit
// ...`. Note JS_E2E_TEST_COMMAND is invoked as `npx $(JS_E2E_TEST_COMMAND)`, and npx can't resolve
// a package.json script by name (only packages/binaries) - it must be set to the `node
// scripts/cypressParallel.mjs` form, not a yarn script name like `test:e2e:parallel`. npx does
// fall through to whatever's already on PATH for a command it doesn't need to install, so `npx
// node ...` still just runs the real node binary.
//
// Do not pass --spec yourself - this script owns spec distribution across workers.

import { globSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SPEC_PATTERN = 'tests/cypress/e2e/**/*.test.js';
// Matches JS_BUILD_TESTS_DIRECTORY's own default in .make/js.mk, and respects it when CI
// overrides it - CI's own report-merging step (jsMergeReports, see js-do-e2e-test in
// .make/js.mk) globs `$(JS_BUILD_TESTS_DIRECTORY)/e2e*.xml` non-recursively, so worker output
// has to land directly in this directory, not a subfolder, for GitLab's own Tests tab to see it.
const REPORT_DIR = process.env.JS_BUILD_TESTS_DIRECTORY ?? 'build/tests';
// Deliberately does NOT match CI's own `e2e*.xml` merge glob (see REPORT_DIR above) - otherwise
// CI's own merge step would ingest this alongside the per-spec files it's built from and
// double-count every result.
const MERGED_REPORT_NAME = 'parallel-report-merged.xml';
// Call the local binary directly rather than going through npx/npm - this repo is a Yarn
// project with no npm workflow, and shelling through npx here just adds npm's own config-noise
// (env warnings etc.) to every one of the N concurrent workers for no benefit.
const CYPRESS_BIN = join(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '.bin', 'cypress');

const rawArgs = process.argv.slice(2);
let WORKERS = Number(process.env.CYPRESS_PARALLEL_WORKERS ?? 4);
let dryRun = false;
const extraArgs = [];
for (const arg of rawArgs) {
  if (arg.startsWith('--workers=')) {
    WORKERS = Number(arg.split('=')[1]);
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--') {
    continue; // tolerated for anyone used to the old `-- <args>` convention
  } else {
    extraArgs.push(arg);
  }
}

if (extraArgs.some((a) => a === '--spec' || a.startsWith('--spec='))) {
  console.error(
    'cypressParallel.mjs distributes specs across workers itself - do not pass --spec.'
  );
  process.exit(1);
}

const specs = globSync(SPEC_PATTERN).sort();
if (specs.length === 0) {
  console.error(`No specs found matching ${SPEC_PATTERN}`);
  process.exit(1);
}

const workerCount = Math.max(1, Math.min(WORKERS, specs.length));

// Balance workers by each spec file's line count as a proxy for how much it does (more
// clicks/waits ~ more lines) - a greedy longest-first bin-pack onto whichever worker is
// currently lightest. This is a self-maintaining substitute for hand-tracked per-spec
// durations, which would silently go stale as specs are added or edited.
const weighted = specs
  .map((spec) => ({ spec, weight: readFileSync(spec, 'utf8').split('\n').length }))
  .sort((a, b) => b.weight - a.weight);

const bins = Array.from({ length: workerCount }, () => ({ specs: [], weight: 0 }));
for (const item of weighted) {
  const lightest = bins.reduce((min, bin) => (bin.weight < min.weight ? bin : min), bins[0]);
  lightest.specs.push(item.spec);
  lightest.weight += item.weight;
}

// Concurrent workers must not all write the same junit file - if the caller hasn't already
// asked for a specific reporter, default to one hashed filename per worker (mocha-junit-reporter
// expands [hash] per spec file too, so this is safe even with multiple specs per worker).
const callerSetReporterOptions = extraArgs.some((a) => a.startsWith('--reporter-options'));
const reporterArgsFor = (workerIndex) =>
  callerSetReporterOptions
    ? []
    : [
        '--reporter',
        'junit',
        '--reporter-options',
        `mochaFile=${REPORT_DIR}/e2e-tests-worker${workerIndex + 1}-[hash].xml`
      ];

if (!callerSetReporterOptions) {
  mkdirSync(REPORT_DIR, { recursive: true });
}

console.log(`Running ${specs.length} specs across ${bins.length} worker(s):`);
bins.forEach((bin, i) => {
  console.log(`  worker ${i + 1}: ${bin.specs.length} spec(s), ~${bin.weight} lines`);
  bin.specs.forEach((spec) => console.log(`    ${spec}`));
});

if (dryRun) {
  process.exit(0);
}

// Cypress bundles its own Xvfb for headless Linux runs, but it hardcodes display :99 - fine for
// one instance, but concurrent workers all racing to claim :99 collide ("Server is already active
// for display 99"). xvfb-run --auto-servernum gives each worker its own free display instead, so
// wrap Cypress with it on Linux. Not needed (and not available) on macOS/Windows, where Cypress
// either has no Xvfb dependency or uses a real display directly.
const useXvfbRun = process.platform === 'linux';

const runWorker = (bin, index) =>
  new Promise((resolve) => {
    const cypressArgs = [
      'run',
      '--spec',
      bin.specs.join(','),
      ...reporterArgsFor(index),
      ...extraArgs
    ];
    const [cmd, args] = useXvfbRun
      ? [
          'xvfb-run',
          [
            '--auto-servernum',
            // xvfb-run's own default screen (unspecified) is often too small/low-colour-depth
            // for Chromium to render into - match what Cypress's own bundled Xvfb normally sets
            // up rather than trading the display collision for a blank/broken render.
            '--server-args=-screen 0 1280x1024x24',
            CYPRESS_BIN,
            ...cypressArgs
          ]
        ]
      : [CYPRESS_BIN, cypressArgs];
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('exit', (code) => resolve({ worker: index + 1, code: code ?? 1 }));
    // Without this, a spawn failure (e.g. xvfb-run missing) never fires 'exit', so the
    // Promise.all below would hang forever instead of failing loudly.
    child.on('error', (err) => {
      console.error(`Worker ${index + 1} failed to start (${cmd}): ${err.message}`);
      resolve({ worker: index + 1, code: 1 });
    });
  });

const results = await Promise.all(bins.map(runWorker));

if (callerSetReporterOptions) {
  console.log(
    '\nA custom --reporter-options was supplied, so this script does not know where each ' +
      "worker's output landed - skipping the consolidated summary."
  );
} else {
  printConsolidatedSummary();
}

const failed = results.filter((r) => r.code !== 0);
if (failed.length > 0) {
  console.error(`\nWorker(s) failed: ${failed.map((r) => r.worker).join(', ')}`);
  process.exit(1);
}

console.log('\nAll workers passed.');

// Column order/labels, box-drawing borders, mm:ss durations and "-" for zero all match Cypress's
// own per-spec results table (the one each worker already prints for its own subset), so the
// consolidated view reads as a natural continuation of it rather than a different format bolted
// on. One deliberate difference: Cypress's own table has a separate Pending column (tests marked
// .skip()) alongside Skipped (tests that never ran because a before-each hook failed) - the
// exported JUnit XML doesn't preserve that distinction (mocha-junit-reporter just omits the
// <testcase> for either case), so both are folded into one Skipped column here.
function GREEN(s) {
  return `\x1b[32m${s}\x1b[0m`;
}

function RED(s) {
  return `\x1b[31m${s}\x1b[0m`;
}

function formatMinSec(seconds) {
  const total = Math.round(seconds);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function dashIfZero(n) {
  return n === 0 ? '-' : String(n);
}

// Each worker writes one JUnit file per spec file (mocha-junit-reporter expands [hash] per spec,
// not per worker), so this pulls every spec's own result back together into one table and one
// merged XML file - the whole point being that running specs across N processes shouldn't mean
// looking in N different places to see what happened.
function printConsolidatedSummary() {
  const reportFiles = globSync(`${REPORT_DIR}/*.xml`).filter(
    (f) => !f.endsWith(MERGED_REPORT_NAME)
  );
  if (reportFiles.length === 0) {
    console.log(`\nNo JUnit reports found under ${REPORT_DIR}/ - nothing to consolidate.`);
    return;
  }

  const perSpec = reportFiles.map((f) => parseJUnitFile(f, readFileSync(f, 'utf8')));
  perSpec.sort((a, b) => a.file.localeCompare(b.file));

  const totals = perSpec.reduce(
    (acc, s) => ({
      tests: acc.tests + s.tests,
      passing: acc.passing + s.passing,
      failures: acc.failures + s.failures,
      skipped: acc.skipped + s.skipped,
      time: acc.time + s.time
    }),
    { tests: 0, passing: 0, failures: 0, skipped: 0, time: 0 }
  );

  const headerCells = ['', 'spec', 'time', 'tests', 'passing', 'failing', 'skipped'];
  const aligns = ['left', 'left', 'right', 'right', 'right', 'right', 'right'];
  const dataRows = perSpec.map((s) => ({
    failed: s.failures > 0,
    cells: [
      s.failures > 0 ? '✖' : '✔',
      s.file,
      formatMinSec(s.time),
      dashIfZero(s.tests),
      dashIfZero(s.passing),
      dashIfZero(s.failures),
      dashIfZero(s.skipped)
    ]
  }));
  const totalFailed = totals.failures > 0;
  const failedSpecs = dataRows.filter((r) => r.failed).length;
  const percent = perSpec.length ? Math.round((failedSpecs / perSpec.length) * 100) : 0;
  const totalLabel = totalFailed
    ? `✖  ${failedSpecs} of ${perSpec.length} failed (${percent}%)`
    : `✔  All specs passed`;
  const totalCells = [
    '',
    totalLabel,
    formatMinSec(totals.time),
    dashIfZero(totals.tests),
    dashIfZero(totals.passing),
    dashIfZero(totals.failures),
    dashIfZero(totals.skipped)
  ];
  // The total row's label lives in the spec column and needs that column wide enough to fit it -
  // width is computed from every cell below, so this just has to be present before that happens.

  const allRows = [headerCells, ...dataRows.map((r) => r.cells), totalCells];
  const widths = headerCells.map((_, col) => Math.max(...allRows.map((r) => r[col].length)));
  const pad = (s, w, align) => (align === 'right' ? s.padStart(w) : s.padEnd(w));
  const border = (l, m, r) => l + widths.map((w) => '─'.repeat(w + 2)).join(m) + r;
  const renderRow = (cells) =>
    '│ ' + cells.map((c, i) => pad(c, widths[i], aligns[i])).join(' │ ') + ' │';

  console.log('\nConsolidated results:\n');
  console.log(border('┌', '┬', '┐'));
  console.log(renderRow(headerCells));
  console.log(border('├', '┼', '┤'));
  dataRows.forEach((r) => {
    const line = renderRow(r.cells);
    console.log(r.failed ? RED(line) : GREEN(line));
  });
  console.log(border('├', '┼', '┤'));
  console.log(totalFailed ? RED(renderRow(totalCells)) : GREEN(renderRow(totalCells)));
  console.log(border('└', '┴', '┘'));

  const merged =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<testsuites name="Parallel Mocha Tests" tests="${totals.tests}" failures="${totals.failures}" time="${totals.time}">\n` +
    reportFiles.map((f) => extractTestsuites(readFileSync(f, 'utf8'))).join('') +
    '</testsuites>\n';
  const mergedPath = `${REPORT_DIR}/${MERGED_REPORT_NAME}`;
  writeFileSync(mergedPath, merged);
  console.log(`\nMerged JUnit report written to ${mergedPath}`);
}

function parseJUnitFile(path, xml) {
  const testsMatch = xml.match(/<testsuites[^>]*\btests="(\d+)"/);
  const failuresMatch = xml.match(/<testsuites[^>]*\bfailures="(\d+)"/);
  const timeMatch = xml.match(/<testsuites[^>]*\btime="([\d.]+)"/);
  const fileMatch = xml.match(/\bfile="([^"]+)"/);
  const tests = Number(testsMatch?.[1] ?? 0);
  const failures = Number(failuresMatch?.[1] ?? 0);
  // Cypress/mocha-junit-reporter doesn't mark skipped or "pending" (e.g. a test after a failed
  // before-each) tests with any tag - it just omits their <testcase> entirely while still
  // counting them in <testsuites tests="N">, so the only way to recover the skipped count is
  // the gap between that total and how many <testcase> elements actually appear.
  const testcaseCount = (xml.match(/<testcase[^>]*>/g) ?? []).length;
  return {
    file: fileMatch?.[1] ?? path,
    tests,
    failures,
    skipped: Math.max(0, tests - testcaseCount),
    passing: Math.max(0, testcaseCount - failures),
    time: Number(timeMatch?.[1] ?? 0)
  };
}

function extractTestsuites(xml) {
  const match = xml.match(/<testsuites[^>]*>([\s\S]*)<\/testsuites>/);
  return match ? match[1] : '';
}
