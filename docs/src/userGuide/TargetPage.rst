Target Page
~~~~~~~~~~~

The Target Page allows you to add target(s) to your proposal (see :numref:`Figure %s <targetpage>`).

.. |icoresolve| image:: /images/resolvebutton.png
   :width: 10%
   :alt: Landing page icons

.. |editicon| image:: /images/editicon.png
   :width: 6%
   :alt: Landing page icons

.. |deleteicon| image:: /images/deleteicon.png
   :width: 6%
   :alt: Landing page icons

.. _targetpage:

.. figure:: /images/targetPage.png
   :width: 90%
   :align: center
   :alt: Image of the Target page for 'List of Targets'. 

   Target page for 'List of Targets'

.. _targetpagenopstbeam:

.. figure:: /images/targetPageDefaultNoPSTBeam.png
   :width: 90%
   :align: center
   :alt: Image of the Target page for 'Pulsar Timing Beam' section. Default selection is 'No Beam'.

   Target page for 'Pulsar Timing Beam' section. Default selection is 'No Beam'.

.. _targetpageaddpstbeams:

.. figure:: /images/targetPageAddPSTBeam.png
   :width: 90%
   :align: center
   :alt: Image of the Target page for 'Pulsar Timing Beam' section. To add a new PST Beam.

   Target page for 'Pulsar Timing Beam' section. Selected 'Multiple Beams'.

.. _targetpageimport:

.. figure:: /images/targetPageimport.png
   :width: 90%
   :align: center
   :alt: Image of the Target page for 'Import Targets'. 

   Target page for 'Import Targets'

.. _targetpageedit:

.. figure:: /images/targetPageedit.png
   :width: 90%
   :align: center
   :alt: Target page showing modal to edit target. 

   Target page showing modal to edit target


.. _targetpagedelete:

.. figure:: /images/targetPagedelete.png
   :width: 90%
   :align: center
   :alt: Target page showing modal to delete target.

   Target page showing modal to delete target



Layout and Navigation
=====================

The layout of the Target Page shows three different ways to specify targets (top of page):

1. **List of Targets**: The default reference system is the ICRS (the only system available at the moment).
   
   - **Left side** shows a table with the columns below:
  
       - Name of the target.
       - Right Ascension in Sexagesimal format.
       - Declination in Sexagesimal format.
       - Velocity in the selected unit.
       - Redshift
       - PST Beam
       - Actions: |editicon| icon to edit (see :numref:`Figure %s <targetpageedit>`) and |deleteicon| to delete a target from the list (see :numref:`Figure %s <targetpagedelete>`).
  
   - **Right side**:
  
       - **Add Target**: Add individual targets by providing details of the target such as the name and coordinates (see :numref:`Figure %s <targetpage>`). The velocity/redshift field is optional to specify the velocity (km/s or m/s) or redshift. For known targets, these parameters can be auto-populated by querying the *SIMBAD* or *NED* database using the |icoresolve| button with the name e.g ``M2``. If the target name is not recognised, the error text ``Unable to resolve provided name`` is displayed. PST Beam(s) can be added to the target by clicking the 'Multiple Beams' radio button. Click the 'Add' button and provide details of the beam such as the name and coordinates before clicking the 'Confirm button'. For known beams, these parameters can be auto-populated by querying the SIMBAD or NED database using the 'Resolve' button.
       - **Import from file**: Add a list of targets by uploading a ``.csv`` file (see :numref:`Figure %s <targetpageimport>`). This is controlled by the selected reference system. For ICRS, the csv header should be ``name, ra, dec``. If a file with a wrong format is uploaded, the error ``ICRS schema is invalid``. For rows with empty values in any fields, the rows will be omitted. 
       - **Spatial Imaging**: *Not available at the moment*.
  
   

2. **Target Mosaic**: *Not available at the moment*.

3. **No Specific Target**: *Not available at the moment*.




Key Information and Actions
===========================

- Add target:
  Use the entry form on the right of the page, under the tab ''**Add Target**'' If adding multiple PST Beams, these will display in a comma separated format under the column ''PST Beam'' in the target list.

- Edit target:
  When selected, a modal is displayed with a form containing details of the selected target (see :numref:`Figure %s <targetpageedit>`).
  These fields can be adjusted and will update the target upon confirmation.

- Delete targets:
  When selected, a modal is displayed showing details of the selected target (see :numref:`Figure %s <targetpagedelete>`).
  There is the option to confirm or cancel.
  If confirmation is selected, then the target is removed, as well as any links to observations.

- Resolve Targets:
  Resolve targets by name using the |icoresolve| button which allows you to query SIMBAD or NED.
  This is available as part of the functionality of ''**Add Target**''

