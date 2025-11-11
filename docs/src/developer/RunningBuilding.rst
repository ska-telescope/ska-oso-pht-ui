Running / Building the Application
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Scripts for running, testing, and building the application are provided as part of the standard configuration. These are run using YARN and listed in the scripts section of the package.json file.

From the project directory, you can run any of the following:

- `> yarn dev`

  Runs the app in the development mode at [http://localhost:6101](http://localhost:6101). The app will recompile and restart if you make any edits to the source files. Any linting errors will also be shown in the console.

- `> yarn local`

  Runs the app in the development mode without resetting the public/env.js file at [http://localhost:6101](http://localhost:6101). The app will recompile and restart if you make any edits to the source files. Any linting errors will also be shown in the console.

- `> yarn skao:update`

  yarn will update the repository with the latest SKAO libraries

- `> yarn start`

  Same as `yarn dev` but for some implementations it is prefixed with NODE_ENV=testing. This is used in the CI/CD Processes

- `> yarn cypress`

  Launches Cypress which has been set up to provide component testing. For further information on the use of Cypress, see https://docs.cypress.io/guides/component-testing/overview

- `> yarn test`

  Launches the test runner in the interactive watch mode. See the [testing](#testing) section for more information.

- `> yarn build`

  Builds the app for production to the `build` folder. The build is minified and any JSX is transpiled to JavaScript. Your app is ready to be deployed!

- `> yarn audit`

  Checks the dependencies to see if there are any vulnerabilities.  

Running the application inside a container
============================================

There are two ways that this can be done as below:

1. Run using docker compose

- `> docker-compose up -d`

2. build the docker file in the root directory and run the container exposing port 6101.

- `> docker build -t ska-oso-pht-ui .`
- `> docker run -p 6101:6101 ska-oso-pht-ui`

The project will then be accessible at the url http://localhost:6101/

Building the documentation 
============================================

To build the documentation, you can use the following command:

    > make docs-build html

This will generate the documentation files in the `docs/build/html` directory.