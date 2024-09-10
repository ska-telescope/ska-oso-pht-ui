Creating a new release
======================

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
