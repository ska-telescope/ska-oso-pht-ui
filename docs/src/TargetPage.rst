Target Page
~~~~~~~~~~~

The "Target Page" allows you to add target(s) to your proposal (see 
:numref:`Figure %s <targetpage>`).

.. |icoresolve| image:: /images/resolvebutton.png
   :width: 20%
   :alt: Landing page icons

.. _targetpage:

.. figure:: /images/targetPage.png
   :width: 90%
   :alt: screen in light & dark mode 

   Target page in light mode

Layout and Navigation
=====================

The layout of the Target Page shows:

Target category area (top of page): Three sections offer different ways to specify your targets:

1. List of Targets: You will need to select the reference coordinate system before entering targets as display above the table on the left. The available options are "Equatorial" and "Galactic".
   
   - **Right side (Add Target)**: Add individual targets by providing details about the target such as the name and coordinates. The velocity/redshift field allows you to choose velocity or redshift and this field is optional. Use the "Add target" button to add the targets to the target table on the left. The target fields can be auto populated using |icoresolve| button by providing the name. This buttons queries  the *SIMBAD* and *NED* database. Currently, only the "Add Target" tab is active. The "Spatial imaging" tabs are not available yet.
   - **Right side (Import from file)**: Add a list or targets using a csv file. For equatorial, the csv header should be ``name,ra,dec`` and for Galactic the csv header should be ``name,longitude,latitude``. For rows with empty values in any fields, the whole row will be omitted.
   - **Left side**: View a list of added targets with actions such as edit and delete options --- only delete is active for now.
   

2. Target Mosaic: Using Aladin Lite Viewer

3. No Specific Target: Select this option for Target of Opportunity  --- *not available at he moment*.




Key Information and Actions
===========================

- Add target(s).
- Delete targets.
- Resolve targets by name using the |icoresolve| button which allows you to query SIMBAD and NED.


Next Steps
==========

After specifying your targets using one of the provided methods, click "Observation" or any other page to proceed.


