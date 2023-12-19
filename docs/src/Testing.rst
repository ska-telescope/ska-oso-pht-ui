Testing
~~~~~~~

Writing
=======

We use Cypress as the test running framework. It will look for test files within a number of locations, however the standard that the SKAO will employ will be the use of `.cy.{tsx | jsx}` in the same folder as the component being tested.

```
components
└─ App
   |  App.cy.tsx
   |  App.tsx
└─ ReactSkeleton
   |  ReactSkeleton.cy.tsx
   |  ReactSkeleton.tsx

```

Note that the ReactSkeleton component is exposed via WebPack 5 ModuleFederationPlugin, so this name should be changed to reflect the application being written ( e.g. SignalDisplay, DataProductDashboard ...)

See the developer guide for more information

Running
=======

To run the interactive test runner, execute

    > yarn test

This will also watch the source files and re-run when any changes are detected

To run the tests with coverage, execute

    > yarn test:coverage

The coverage results are displayed in the console. They are also written to the `coverage` folder.

- `./build/coverage/index.html` - open in a web browser to view

**All the tests should pass before merging the code**

Code Analysis
=============

[ESLint](https://ESLint.org/) and [Prettier](https://prettier.io/) are included as code analysis and formatting tools.
These do not need installing as they're included in `node_modules` by running `yarn init`.

These tools can be run in the command line or integrated into your IDE (recommended).

JavaScript based SKA projects must comply with the [AirBnB JavaScript Style Guide](https://github.com/airbnb/javascript). These rules are included in this project and ESLint and Prettier are configured to use them.

### Running

To run the analysis tools, execute

    > yarn code-analysis

This will display any errors in the command line. If there are any errors, YARN will exit with a non-zero code, the `-s` argument suppresses this and cleans up the output.

