Observation Page
~~~~~~~~~~~~~~~~
On entering the observation page for the first time, it will look like :ref:`Figure <obspage2>`. To add an observation set(s) to your proposal, click the |icoobs| button.
and after filling out the form and clicking "Add", the page will look like :ref:`Figure <obspage1>`.




.. |icoobs| image:: /images/obsbutton.png
   :width: 20%
   :alt: Page filter


.. _obspage2:

.. figure:: /images/observationPage2.png
   :width: 90%
   :alt: screen in light & dark mode 


.. _obspage1:
.. figure:: /images/observationPage.png
   :width: 90%
   :alt: screen in light & dark mode 

.. note:: 
   :ref:`Figure <obspage1>` has two sections.

Layout and Navigation
=====================

The Observation Page consists of two distinct sections see :ref:`Figure <obspage1>`:

1. Observation set list and Target Selection:


- Observation set list table which shows a table that displays the following details :
  
   - observation Id
   - observation group id: displays the group Id if a given observation belongs to a group.
   - array 
   - sub-array
   - type of observation
   - Sensitivity Calculation status: clicking on this status will open a modal with the results see :ref:`Figure <senscal>`. 
   - *actions* : only delete action is available at the moment.

- Target List: 
  
   - Select targets associated with the chosen observation by ticking the checkboxes. Use "Selected" and "Not Selected" buttons for filtering.
   - The status icon next to each linked target-observation shows the status of a Sensitivity Calculation.


.. tip:: 

   - You can add targets to an observation set by selecting the target and each time, the sensitivity calculations are computed.




.. admonition:: Sensitivity Calculation Display

   Further details of this can be found in the appropriate section of this guide

   
1. Observation Mode Details:

- This section appears upon clicking "Add Observation".

.. figure:: /images/observationSetup.png
   :width: 90%
   :alt: screen in light & dark mode 

- Enter specific parameters including:

  - Observing Band: Dropdown menu to choose available bands.
  - Array Configuration: Dropdown menu to choose available configurations.
  - Observation Type: Select either "Continuum" or "Zoom" mode.
  - Other fields: Additional details may appear based on your selections, influenced by the Sensitivity Calculator.
  - Add: Once finished, click this button to add the defined observation to the list.

3. Observation Group

- The user has the option to group observations together by adding them to a group.
- The observation can be added to an existing group or a new group can be created.
- Adding an observation to a group is optional.
- At the moment, once an observation has been added to a group, it can not be removed.

4. Sensitivity Calculator results

- This modal appears upon clicking on the status icon at the right of the linked target-observation
- This displays the results returned from the Sensitivity Calculator API.
- There is also a modal showing the results for the list of linked targets, when clicking on the observation status.

.. _senscal:

.. figure:: /images/sensitivityCalculatorModal.png
   :width: 90%
   :alt: screen in light & dark mode 




Key Information and Actions
===========================

- The Observation Page allows you to:

  - Create new observation entries.
  - Link observations to specific targets.
  - Define key parameters like array configuration, observation type, and additional details.
  - View and manage your observation list.
  - Utilize dynamic help for field descriptions.
  - View the Sensitivity Calculator results for each linked observation-target.

Next Steps
==========

After specifying your observation details using the provided methods, click "Technical" to proceed to the next page, where you'll provide more specific technical information about your proposal.

.. admonition:: Confirmation Summary

   Ensure proposal is save regularly