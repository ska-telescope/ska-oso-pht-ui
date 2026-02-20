Target Page
~~~~~~~~~~~

The Target Page allows you to add a single target to your submission (see :numref:`Figure %s <targetpage>`).

.. |icoresolve| image:: /images/resolvebutton.png
   :width: 10%
   :alt: target page icons

.. |editicon| image:: /images/editicon.png
   :width: 6%
   :alt: target page icons

.. |deleteicon| image:: /images/deleteicon.png
   :width: 6%
   :alt: target page icons

.. _targetpage:

.. figure:: /images/targetPageSV2.png
   :width: 90%
   :align: center
   :alt: Image of the Target page. 

   Target page

.. _targetpageedit:

.. figure:: /images/targetPageEdit.png
   :width: 90%
   :align: center
   :alt: Target page showing modal to edit target. 

   Target page showing modal to edit target


.. _targetpagedelete:

.. figure:: /images/targetPageDelete.png
   :width: 90%
   :align: center
   :alt: Target page showing modal to delete target.

   Target page showing modal to delete target



Layout and Navigation
=====================

The layout of the Target Page shows for the entry of a single target to the submission (top of page)
The default reference system is the ICRS (the only system available at the moment).
   
- **Left side** shows a table with the columns below:
  
   - Actions: |editicon| icon to edit (see :numref:`Figure %s <targetpageedit>`) and |deleteicon| to delete a target from the list (see :numref:`Figure %s <targetpagedelete>`).
   - Name of the target.
   - Right Ascension in Sexagesimal format.
   - Declination in Sexagesimal format.
   - Velocity in the selected unit.
   - Redshift

- **Right side**:
  
     Add individual target by providing details of the target such as the name and coordinates (see :numref:`Figure %s <targetpage>`). The velocity/redshift field is optional to specify the velocity (km/s or m/s) or redshift. For known targets, these parameters can be auto-populated by querying the *SIMBAD* or *NED* database using the |icoresolve| button with the name e.g ``M2``. If the target name is not recognised, the error text ``Unable to resolve provided name`` is displayed.


Key Information and Actions
===========================

- Add target:
  Use the entry form on the right of the page, under the tab ''**Add Target**''.

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




|helpdesk|