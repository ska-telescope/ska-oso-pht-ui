Target Page
~~~~~~~~~~~

The "Target Page" allows you to add target(s) to your proposal (see 
:numref:`Figure %s <targetpage>`).

.. |icoresolve| image:: /images/resolvebutton.png
   :width: 10%
   :alt: Landing page icons

.. _targetpage:

.. figure:: /images/targetPage.png
   :width: 90%
   :align: center
   :alt: Image of the Target page

   Target page

Layout and Navigation
=====================

The layout of the Target Page shows:

Target category area (top of page), offering three different ways to specify your targets:

1. **List of Targets**: You should select the reference system before entering targets as displayed above the table on the left. The available options are "Equatorial" and "Galactic".
   
   - **Right side**:
  
       - Add Target: Add individual targets by providing details about the target such as the name and coordinates. The optional velocity/redshift field allows you to specify a source velocity or redshift. Use the "Add target" button to add the targets to the target table on the left. The target fields can be auto-populated using |icoresolve| button by providing the name. This buttons queries  the *SIMBAD* and *NED* database. If the target name is not recognised, the error text "Unable to resolve provided name" is displayed.
       - Import from file: Add a list of targets by uploading a .csv file. This is controlled by the selected coordinate system which can be equatorial or galactic (unavailable at the moment). For equatorial, the csv header should be ``name, ra, dec``. For rows with empty values in any fields, the entire row will be omitted.
       - Spatial Imaging: *Not available at the moment*.
   - **Left side**: 
       - View a list of added targets with the options to edit or delete.
   

2. **Target Mosaic**: *Not available at the moment*.

3. **No Specific Target**: *Not available at the moment*.




Key Information and Actions
===========================

- Add target:
  Use the entry form on the right of the page, under the tab ''**Add Target**''

- Edit target:
  When selected, a modal is displayed with a form containing details of the selected target.
  These fields can be adjusted and will update the target upon confirmation.

- Delete targets:
  When selected, a modal is displayed showing details of the selected target.
  There is the option to confirm or cancel.
  If confirmation is selected, then the target is removed, as well as any links to observations

- Resolve Targets:
  Resolve targets by name using the |icoresolve| button which allows you to query SIMBAD or NED.
  This is available as part of the functionality of ''**Add Target**''

