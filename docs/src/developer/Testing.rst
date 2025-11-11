Testing
~~~~~~~

Writing
=======

We use Cypress as the test running framework. It will look for test files within a number of locations, however the standard that the SKAO will employ will be the use of `.test.{tsx | jsx}` in the same folder as the component being tested.
Below is a small illustration as an example.

```

components
└─ App
   |  App.test.tsx
   |  App.tsx
└─ ReactSkeleton
   |  ReactSkeleton.test.tsx
   |  ReactSkeleton.tsx

```

Note that the ReactSkeleton component is exposed via WebPack 5 ModuleFederationPlugin, so this name should be changed to reflect the application being written ( e.g. SignalDisplay, DataProductDashboard ...)

See the SKAO developer guide for more information

Running
=======

To run the interactive test runner, execute

    > yarn test

This will also watch the source files and re-run when any changes are detected

To run the tests with coverage, execute

    > yarn test:unit:coverage

The coverage results are displayed in the console. They are also written to the `coverage` folder.

    `./build/coverage/index.html` - open in a web browser to view

To run the ui test runner for unit tests, execute

    > yarn test:unit:ui

The coverage results are also available when using this mode.

**All the tests should pass before merging the code**

End-2-End
=========

To run the ui test runner for e2e tests, execute

    > yarn test:e2e:ui

This will launch Cypress in interactive mode for end-to-end tests.


Examples can be found in the PT UI repo, however below should be a guide in how to follow the standard for enw tests.
Note: This is for BDD Cucumber style cypress testing.

In the cypress/e2e directory
    - Create a feature file for example {createProposal.feature}
    - Create a new directory within cypress/e2e named the EXACT same as the feature file created.
    - Within the new directory for example {createProposal} create a new step definition file for example
    {createProposal.js}

The feature file should follow the format as below

Feature: Creating proposals

  Scenario: Create a basic proposal
  Given I am a PHT user who wants to create a proposal
  When I provide a title and select the proposal category
  Then a proposal with unique ID is created and I can see that on the landing page

The step definition file should follow the format as below.
It is important to note that the text within the Given/When/Then steps MUST match the statements from the feature file.
This example showcases imported methods from a common class, which is recommended to prevent duplication.

import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import {
  clickAddProposal,
  clickCreateProposal, clickHome, clickSaveProposal,
  clickStandardProposalSubTypeTargetOfOpportunity, verifyProposalOnLandingPage
} from '../../common/common';

Given('I am a PHT user who wants to create a proposal', () => {
  clickAddProposal()
});

When('I provide a title and select the proposal category', () => {
  clickStandardProposalSubTypeTargetOfOpportunity()
  clickCreateProposal()
});

Then('a proposal with unique ID is created and I can see that on the landing page', () => {
  clickSaveProposal()
  clickHome()
  verifyProposalOnLandingPage()
});


Code Analysis
=============

[ESLint](https://ESLint.org/) and [Prettier](https://prettier.io/) are included as code analysis and formatting tools.
These do not need installing as they're included in `node_modules` by running `yarn init`.

These tools can be run in the command line or integrated into your IDE (recommended).

JavaScript based SKA projects must comply with the [AirBnB JavaScript Style Guide](https://github.com/airbnb/javascript). These rules are included in this project and ESLint and Prettier are configured to use them.

Running
=======

To run the analysis tools, execute

    > yarn code-analysis

This will display any errors in the command line. If there are any errors, YARN will exit with a non-zero code, the `-s` argument suppresses this and cleans up the output.


Alternatively, you can also run

    > yarn checker

This will display any errors in the command line and fix linting issues by running yarn prettier:fix && yarn lint:fix.

