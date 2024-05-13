Observation Page
~~~~~~~~~~~~~~~~
On entering the observation page for the first time, it will look like :ref:`Figure <obspage2>`. To add an observation set(s) to your proposal, click the |icoobs| button (see :ref:`Add Observation section <obspage1>`) 
and after filling out the form and clicking "Add", the page will look like :ref:`Figure <obspage1>`.




.. |icoobs| image:: /images/obsbutton.png
   :width: 20%
   :alt: Page filter


.. _obspage2:

.. figure:: /images/observationPage2.png
   :width: 90%
   :alt: screen in light & dark mode 

   Figure : Observation Set page.


.. _obspage1:
.. figure:: /images/observationPage.png
   :width: 90%
   :alt: screen in light & dark mode 

   Figure : Observation Set page in light nad dark mode.


Layout and Navigation
=====================

The Observation Page consists of two distinct sections see :ref:`Figure <obspage1>`:


1. Observation set list table which shows a table that displays the following details :
  
   - observation Id: unique id for each observation set.
   - observation group id: displays the group Id if a given observation belongs to a group. This is needed when observations need to happen in parallel or in a group.
   - array: Array of the observation set i.e if MID or LOW.
   - sub-array: This displays the sub-array of observation set.
   - type of observation: If continuum or zoom.
   - Sensitivity Calculation status: clicking on this status will open a modal with the results. See :ref:`Figure <senscal>`. 
   - *actions* : only delete action is available at the moment.

2. Target List: This view allow you to add target(s) by clicking on the check box.
   
   - Select targets associated with the chosen observation set by ticking the checkboxes. Use "Selected" and "Not Selected" buttons for filtering.
   - The status icon next to each linked target-observation shows the status of a Sensitivity Calculation for that target. Hovering on this will display the status and clicking will display the target level results from the sensitivity calculator.
   - The sensitivity based on the sensitivity calculator result.
   - The beam size based on the sensitivity calculator result.


.. tip:: 

   - Sensitivity calculation is done on the fly so you can add and remove targets at any time.



.. _addobs:

Add observation
+++++++++++++++

When the |icoobs|  button is clicked, the  "Add Observation" page as shown in :ref:`Figure <addobspage>` comes up.

.. _addobspage:

.. figure:: /images/observationSetup.png
   :width: 90%
   :alt: screen in light & dark mode 

   Figure : The add observation page.


.. note:: 

   Observation Group

   - The user has the option to group observations together by adding them to a group.
   - The observation can be added to an existing group or a new group can be created.
   - Adding an observation to a group is optional.
   - At the moment, once an observation has been added to a group, it can not be removed.



.. _senscal:

.. figure:: /images/obssenscal.png
   :width: 90%
   :alt: screen in light & dark mode 

   Figure : Sensitivity calculator result modal display.




Key Information and Actions
===========================

- The Observation Page allows you to:

  - Create new observation entries.
  - Link observations to specific targets.
  - Manage observation list.
  - View the Sensitivity Calculator results for each linked observation-target.

Next Steps
==========

After adding observation set(s) you can proceed to the "Technical" page or any other page. 

.. admonition:: Confirmation Summary

   Ensure proposal is saved regularly