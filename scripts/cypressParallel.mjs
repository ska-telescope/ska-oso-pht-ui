#!/usr/bin/env node
// Runs the Cypress e2e suite across several concurrent `cypress run` processes instead of one.
// Cypress itself only parallelises across *separate CI machines* via Cypress Cloud's --record
// --parallel (see cypress.config.mjs's projectId) - this script gets most of the same wall-clock
// win on a single machine, with no cloud dependency, so it works the same way locally and in CI.
//
// Which specs each worker runs is decided by the cypress-split plugin (wired up in
// cypress.config.mjs's setupNodeEvents), driven by the SPLIT/SPLIT_INDEX/SPLIT_FILE/
// SPLIT_OUTPUT_FILE env vars set per worker below - this script itself only owns process
// orchestration: spawning the workers, giving each Linux worker its own Xvfb display, merging
// their JUnit reports, and merging their cypress-split timing files back into one for the next
// run to weight against.
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
// Do not pass --spec yourself - cypress-split owns spec distribution across workers.

import { globSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Only used to count specs (to cap worker count - see workerCount below); cypress-split does the
// actual per-worker selection from Cypress's own resolved spec list, so this must be kept in sync
// with cypress.config.mjs's e2e.specPattern.
const SPEC_PATTERN = 'tests/cypress/e2e/**/*.test.{js,jsx,ts,tsx}';
// Matches JS_BUILD_TESTS_DIRECTORY's own default in .make/js.mk, and respects it when CI
// overrides it - CI's own report-merging step (jsMergeReports, see js-do-e2e-test in
// .make/js.mk) globs `$(JS_BUILD_TESTS_DIRECTORY)/e2e*.xml` non-recursively, so worker output
// has to land directly in this directory, not a subfolder, for GitLab's own Tests tab to see it.
// Mutable: main() below may redirect this to a directory parsed out of the caller's own
// --reporter-options (see reportDirFromReporterOptions) when one was supplied.
let REPORT_DIR = process.env.JS_BUILD_TESTS_DIRECTORY ?? 'build/tests';
// Deliberately does NOT match CI's own `e2e*.xml` merge glob (see REPORT_DIR above) - otherwise
// CI's own merge step would ingest this alongside the per-spec files it's built from and
// double-count every result.
const MERGED_REPORT_NAME = 'parallel-report-merged.xml';
// Call the local binaries directly rather than going through npx/npm - this repo is a Yarn
// project with no npm workflow, and shelling through npx here just adds npm's own config-noise
// (env warnings etc.) to every one of the N concurrent workers for no benefit.
const BIN_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', '.bin');
const CYPRESS_BIN = join(BIN_DIR, 'cypress');
const CYPRESS_SPLIT_MERGE_BIN = join(BIN_DIR, 'cypress-split-merge');
// Where cypress-split's per-worker duration data lives (see runWorker/mergeSplitTimings below).
// Lives under REPORT_DIR so it's wiped along with the rest of the build output rather than
// tracked in git - the first run on a fresh checkout just falls back to an even split until this
// has been populated by a prior run.
const SPLIT_DIR = join(REPORT_DIR, 'cypress-split');
const MERGED_TIMINGS_FILE = join(SPLIT_DIR, 'merged-timings.json');

// If the caller supplied its own --reporter-options (as CI's shared JS_E2E_TEST_DEFAULT_SWITCHES
// always does - see this script's own top-of-file comment), every worker still receives that
// exact same string verbatim (reporterArgsFor below is skipped, not replaced, in that case), so
// mocha-junit-reporter's per-spec [hash] expansion keeps each worker's output collision-free the
// same way it does for this script's own generated reporter-options. That means the mochaFile=
// directory the caller asked for is still knowable from the args - only give up on consolidation
// if it genuinely can't be parsed out (e.g. a --reporter-options with no mochaFile at all).
function reportDirFromReporterOptions(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    let value;
    if (arg.startsWith('--reporter-options=')) {
      value = arg.slice('--reporter-options='.length);
    } else if (arg === '--reporter-options') {
      value = args[i + 1];
    }
    if (value === undefined) {
      continue;
    }
    const match = value.match(/(?:^|,)mochaFile=([^,]+)/);
    if (match) {
      return dirname(match[1]);
    }
  }
  return null;
}

// Wrapped in an async IIFE (rather than left as top-level statements) purely so every early-out
// below can `return` instead of calling process.exit() - process.exit() terminates the process
// immediately, which can truncate console output that's still buffered and waiting to flush when
// stdout isn't a TTY (e.g. piped through `yarn`/CI log capture) - a well-known Node.js gotcha.
// Setting process.exitCode and letting the script run to completion lets Node drain stdout first.
async function main() {
  const overallStart = Date.now();

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
    process.exitCode = 1;
    return;
  }

  const specs = globSync(SPEC_PATTERN);
  if (specs.length === 0) {
    console.error(`No specs found matching ${SPEC_PATTERN}`);
    process.exitCode = 1;
    return;
  }

  const workerCount = Math.max(1, Math.min(WORKERS, specs.length));
  mkdirSync(SPLIT_DIR, { recursive: true });
  // Clear last run's per-worker timing output first - otherwise a leftover worker5/ from a run
  // with a higher --workers count would keep getting folded into every future merge below.
  for (const dir of globSync(join(SPLIT_DIR, 'worker*'))) {
    rmSync(dir, { recursive: true, force: true });
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

  // Redirect REPORT_DIR to wherever the caller's own --reporter-options is actually writing to,
  // so consolidation still works instead of unconditionally bailing out just because this script
  // didn't generate the reporter-options itself (see reportDirFromReporterOptions above).
  let knowReportDir = !callerSetReporterOptions;
  if (callerSetReporterOptions) {
    const derivedReportDir = reportDirFromReporterOptions(extraArgs);
    if (derivedReportDir) {
      REPORT_DIR = derivedReportDir;
      knowReportDir = true;
    }
  }

  if (knowReportDir) {
    mkdirSync(REPORT_DIR, { recursive: true });
    // Clear last run's JUnit output first - otherwise printConsolidatedSummary() below finds
    // both this run's and every previous run's report for the same spec (each with its own
    // [hash]-suffixed filename, so nothing overwrites the old one) and double-counts it.
    for (const file of globSync(`${REPORT_DIR}/*.xml`)) {
      rmSync(file, { force: true });
    }
  }

  console.log(`Running ${specs.length} spec(s) across ${workerCount} worker(s).`);
  console.log(
    'Per-worker spec assignment is logged by cypress-split below as each worker starts.'
  );

  if (dryRun) {
    return;
  }

  // Cypress bundles its own Xvfb for headless Linux runs, but it hardcodes display :99 - fine for
  // one instance, but concurrent workers all racing to claim :99 collide ("Server is already
  // active for display 99"). xvfb-run --auto-servernum gives each worker its own free display
  // instead, so wrap Cypress with it on Linux. Not needed (and not available) on macOS/Windows,
  // where Cypress either has no Xvfb dependency or uses a real display directly.
  const useXvfbRun = process.platform === 'linux';

  const runWorker = (index) =>
    new Promise((resolve) => {
      const cypressArgs = ['run', ...reporterArgsFor(index), ...extraArgs];
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
      // Own subfolder per worker so each one's cypress-split output file can't race with another
      // worker's write - mergeSplitTimings() below combines them back into one file afterwards.
      const workerSplitDir = join(SPLIT_DIR, `worker${index + 1}`);
      mkdirSync(workerSplitDir, { recursive: true });
      const child = spawn(cmd, args, {
        stdio: 'inherit',
        env: {
          ...process.env,
          SPLIT: String(workerCount),
          SPLIT_INDEX: String(index),
          SPLIT_FILE: MERGED_TIMINGS_FILE,
          SPLIT_OUTPUT_FILE: join(workerSplitDir, 'timings.json')
        }
      });
      child.on('exit', (code) => resolve({ worker: index + 1, code: code ?? 1 }));
      // Without this, a spawn failure (e.g. xvfb-run missing) never fires 'exit', so the
      // Promise.all below would hang forever instead of failing loudly.
      child.on('error', (err) => {
        console.error(`Worker ${index + 1} failed to start (${cmd}): ${err.message}`);
        if (cmd === 'xvfb-run' && err.code === 'ENOENT') {
          console.error(
            'xvfb-run is not installed - on Ubuntu/Debian: sudo apt-get update && sudo apt-get install -y xvfb'
          );
        }
        resolve({ worker: index + 1, code: 1 });
      });
    });

  const results = await Promise.all(
    Array.from({ length: workerCount }, (_, index) => runWorker(index))
  );

  console.log(`\nTotal wall-clock time: ${formatMinSec((Date.now() - overallStart) / 1000)}`);

  mergeSplitTimings();

  if (knowReportDir) {
    printConsolidatedSummary();
  } else {
    console.log(
      '\nA custom --reporter-options was supplied without a recognisable mochaFile=, so this ' +
        "script does not know where each worker's output landed - skipping the consolidated " +
        'summary.'
    );
  }

  const failed = results.filter((r) => r.code !== 0);
  if (failed.length > 0) {
    console.error(`\nWorker(s) failed: ${failed.map((r) => r.worker).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  console.log('\nAll workers passed.');
}

await main();

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

// Combines every worker's own SPLIT_OUTPUT_FILE (each written independently, so no write races)
// back into the one MERGED_TIMINGS_FILE that the *next* run reads via SPLIT_FILE to weight its
// split by real spec durations instead of an even count-based split. Uses cypress-split's own
// merge CLI rather than reimplementing its (averaging, per-spec) merge logic here.
function mergeSplitTimings() {
  // If every worker died before writing its own timings.json (e.g. they all failed to spawn),
  // don't overwrite MERGED_TIMINGS_FILE with an empty `durations: []` - cypress-split's own
  // duration-weighting divides by previousDurations.length when reading SPLIT_FILE back in, so an
  // empty file turns into a 0/0 = NaN average that poisons its bin-packing (a NaN sum can never
  // compare as "smaller" than another bin), starving most workers on the *next* run instead of
  // just falling back to an even split like a missing SPLIT_FILE does. Leave any pre-existing
  // (good) merged file alone rather than clobbering it with this run's empty result.
  if (globSync(join(SPLIT_DIR, 'worker*', 'timings.json')).length === 0) {
    console.log('\nNo worker produced timing data this run - leaving cypress-split timings as is.');
    return;
  }
  const result = spawnSync(
    CYPRESS_SPLIT_MERGE_BIN,
    ['--parent-folder', SPLIT_DIR, '--split-file', 'timings.json', '--output', MERGED_TIMINGS_FILE],
    { stdio: 'inherit' }
  );
  if (result.status !== 0) {
    console.error(
      '\nWarning: failed to merge cypress-split timing data - next run will fall back to an ' +
        'even split.'
    );
  }
}
