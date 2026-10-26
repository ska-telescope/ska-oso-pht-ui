Testing
~~~~~~~

The application has two kinds of automated tests:

- **Unit tests**, written with Vitest and React Testing Library, for components, pages, services
  and utilities in isolation.
- **End-to-end (e2e) tests**, written with Cypress, which drive the real application in a browser
  against a real backend.

Unit tests
==========

Writing
-------

Unit tests live next to the code they test, in a file with the same name ending in
``.test.tsx``:

.. code-block:: text

    src/pages/TitlePage
    ├── TitlePage.tsx
    └── TitlePage.test.tsx

Vitest finds every ``*.test.tsx`` file. Tests run in a simulated browser (happy-dom), and
``src/setupTests.ts`` sets up the shared mocks and environment variables every test needs.

Running
-------

To run the unit tests once, with coverage (the same as ``make js-test``, which CI runs):

.. code-block:: bash

    yarn test:unit

A JUnit report is written to ``build/reports/unit-tests.xml``. The coverage results are shown in
the console and written to ``build/reports``; open ``build/reports/index.html`` in a browser to
view them.

Other useful options:

.. code-block:: bash

    # Skip coverage
    yarn test:unit --coverage.enabled=false

    # Run one file, or every file whose path contains the text
    yarn test:unit src/pages/TitlePage

    # Re-run tests as files change
    yarn vitest

End-to-end tests
================

The Cypress tests run against the real backend: ska-oso-services and the Sensitivity Calculator.
They log in through Indigo IAM using shared test accounts. The only thing stubbed is the upload
of documents to S3, because the local backend has no S3 credentials.

Each spec should create the data it needs, rather than relying on what is already in the
database, as the backend may already hold proposals from earlier runs.

Running
-------

.. warning::

    Only run the Cypress tests against a local Minikube deployment, or a dev deployment from a
    branch. The tests create proposals that can't be deleted, so running them against the
    integration deployment would leave that data in its database.

Start the application at http://localhost:6101 with a backend to talk to, for example:

.. code-block:: bash

    make dev-start

See the README for the other ways of pointing it at a backend. Then open Cypress to pick and run
specs:

.. code-block:: bash

    yarn test:e2e:ui

Use the **Chrome** or **Chromium** browser rather than Electron, which is unreliable with this
suite. Keep the Cypress window in front while tests run: when it is in the background, the browser
can stop animating, and tests fail with elements that "exist but are not visible".

.. note::

    Only the older tests in ``submissions`` and ``users`` are affected, as they check that
    elements are visible using the helpers in ``common.js``. Remove this advice once those tests
    have been replaced.

To run the whole suite headless across several workers, as CI does:

.. code-block:: bash

    yarn test:e2e:parallel --browser chromium

CI runs it through ``make js-e2e-test`` against a fresh deployment with an empty database.
Failing tests are retried twice in headless runs.

Test Structure
--------------

Specs are in ``tests/cypress/e2e``:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Folder
     - What it tests
   * - ``sv/flows``
     - A whole Science Verification proposal, from creation to submission, for each observing
       mode. Checks every value survives navigation and reloading.
   * - ``sv/pages``
     - What can be done on one page of the SV proposal editor, and its effect on the rest of
       the proposal. For example, changing the observing mode on the Details page resets the
       observation, and choosing a PST mode on the Observation page changes the Data Product
       fields.
   * - ``sv/features``
     - One behaviour followed through every change that triggers it, wherever those changes are
       made: auto-linking, sensitivity results and validation.
   * - ``submissions``
     - Older proposal editor tests, which are being replaced by the ``sv`` tests. These should all be deleted
       when the refactoring is complete as by then the functionality should be tested elsewhere.
   * - ``users``
     - What each user role sees: the user menu and the pages they can open.

Tests for standard proposals will go in a matching ``standard`` folder.

Shared code is in ``tests/cypress/support``:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - File or folder
     - Contents
   * - ``editor``
     - Helpers for the proposal editor tests, described below.
   * - ``users.js``, ``auth.js``
     - The test users, and logging in as them.
   * - ``common.js``
     - Helpers used by the older ``submissions`` and ``users`` tests.
   * - ``e2e.ts``
     - Setup run before every spec.

Test files, such as the PDFs used for uploads, are in ``tests/cypress/fixtures``.

Writing proposal editor tests
-----------------------------

The proposal editor tests are built from a few pieces in ``tests/cypress/support/editor``:

- ``data``: the proposals the tests enter, one per observing mode, and the default values the
  editor should show.
- ``pageObjects``: one object per editor page, which knows how to fill in and check that page's
  part of a proposal.
- ``cycles.ts``: what differs between kinds of cycle, such as the pages they have and the
  messages they show.
- ``editorActions.ts``: steps that span pages, such as creating, saving, reopening and submitting
  a proposal.
- ``fields.ts``: finding and filling in fields by their label.


Type checking
=============

The application and the Cypress tests have their own TypeScript configurations, so they're type
checked separately:

.. code-block:: bash

    yarn typecheck           # the application (make typecheck)
    yarn typecheck:cypress   # the Cypress tests (make cypress-typecheck)

CI runs both. The Cypress check must pass. The application check is allowed to fail for now, as
the application still has type errors.

Code analysis
=============

`ESLint <https://eslint.org/>`_ and `Prettier <https://prettier.io/>`_ check the code and its
formatting. They're installed with the other dependencies, and work best set up in your IDE.

To check the code from the command line:

.. code-block:: bash

    yarn lint       # ESLint on src
    yarn prettier   # Prettier on src and tests

To fix what can be fixed automatically:

.. code-block:: bash

    yarn checker    # Prettier, then ESLint
