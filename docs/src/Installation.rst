Installation
~~~~~~~~~~~~

The following notes assume you are at the command prompt for your chosen environment.

1.  Confirm Node and YARN are installed and configured correctly, both the following commands should return the relevant version number.

        > node --version

        > yarn --version

2.  Clone the project from GitHub

3.  Allow yarn to be able to include required SKA libraries

        > npm config set @ska-telescope:registry https://artefact.skao.int/repository/npm-internal/

4.  Install all the necessary project dependencies by running

        > yarn init

5.  Install required SKA libraries 

It is expected that required SKA libraries would have been included at this point,
however if this is found not to be the case, the following command will include them.

        > yarn skao:update


Steps to convert to your own application
========================================

Here are the steps required to migrate this application for use within the Portal. These are required so that we can ensure a unique reference into the Portal. For this example we will use the name NewApp as the name of the new application

1. Clone the application into the appropriate folder
2. Follow the installation instructions in the previous paragraph
3. ReactSkeleton.tsx : Change `ReactSkeleton` to `NewApp` in 2 locations
4. ReactSkeleton.tsx : Change filename to `NewApp.tsx
5. ReactSkeleton.cy.tsx : Change `ReactSkeleton` to `NewApp` in 4 locations
6. ReactSkeleton.cy.tsx : Change filename to `NewApp.cy.tsx
7. Change Folder name from ReactSkeleton to NewApp
8. App.tsx : Change `ReactSkeleton` to `NewApp` in 4 locations
9. webPack.config.js : Change path for `ReactSkeleton` so it points to `NewApp\NewApp`.

Compilation and running this application will allow it to be shown within the ReactSkeleton menu item within the developer section of the SKA-Portal. Whilst initial development is being done and until the application is allocated a permanent location, it is suggested that no other WebPack changes are done.

Steps to create a new release
=============================

Note, this does not currently work in the Windows Shell. Use
either Linux, Mac, or Windows WSL.

Also note that the chart names should be updated when you use a different repo name.

The following steps and commands is to create a new release for the portal.

1. Create a new branch from ``main`` branch.
2. Run one of ``make bump-major-release``, ``make bump-minor-release``, or ``make bump-patch-release``
3. Update the ``charts/ska-oso-pht-ui/values.yaml`` file, the `image.version` should be updated.
4. Make sure the following files have the new version:

   * ``charts/ska-oso-pht-ui/Chart.yaml``

   * ``package.json``

   * ``.release``
   
5. Run ``make git-create-tag``
6. Run ``make git-push-tag``
7. You will then be able to merge that branch back in, and the new release should be created.
