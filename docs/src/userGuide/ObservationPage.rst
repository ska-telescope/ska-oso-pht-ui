Observation Page
~~~~~~~~~~~~~~~~
On entering the observation page for the first time, it will look like :numref:`Figure %s <obspage2>`. To add observation set(s) to your proposal, click the |icoobs| button (see :ref:`Add Observation section <obspage1>`) 
and after filling out the form and clicking "Add", the page will look like :numref:`Figure %s <obspage1>`.


Key Information and Actions
===========================

The Observation Page allows you to:

  - Create new observation entries.
  - Link observations to specific targets.
  - Manage observation list.
  - View the Sensitivity Calculator results for each linked observation-target.



.. |icoobs| image:: /images/obsbutton.png
   :width: 20%
   :alt: Page filter


.. _obspage2:

.. figure:: /images/observationPage2.png
   :width: 90%
   :align: center
   :alt: Image of the Observation page

   Image of the Observation page.


.. _obspage1:
.. figure:: /images/observationPage.png
   :width: 90%
   :align: center
   :alt: Observation page with observation set(s) and target(s) added.

   Observation page with observation set(s) and target(s) added.


Layout and Navigation
=====================

The Observation Page consists of two distinct sections - see :numref:`Figure %s <obspage1>`:


1. Observation set table which displays the following details :
  
   - **Id** : Unique id for each observation set.
   - **Group** : Displays the group Id if a given observation belongs to a group. This is needed when observations need to happen in parallel or in a group.
   - **Observing Band** : The observing band. The options are: low band, mid band 1, mid band 2, mid band 5a and mid band 5b.
   - **Subrray** : This displays the sub-array of the observation set.
   - **Type** : Continuum or Zoom.
   - **Status** : Indicates the overall status for the observation. Click to open a modal with individual results - see :numref:`Figure %s <senscal>`. 
   - **Actions** : Icons providing the ability to edit or delete ( after confirmation ) the selected observation.

2. Target List: 
   
   - Select targets associated with the chosen observation set by ticking the checkboxes. Use "Selected" and "Not Selected" buttons for filtering.
   - The status icon next to each linked target-observation shows the status of a Sensitivity Calculation for that target. Hovering over this will display the status and clicking will display the target level results from the sensitivity calculator.
   - The *total sensitivity* based on the sensitivity calculator result.
   - The *beam size* based on the sensitivity calculator result.



.. _senscal:

.. figure:: /images/obssenscal.png
   :width: 90%
   :align: center
   :alt: Sensitivity calculator result modal display.

   Sensitivity calculator result modal display.

.. tip:: 

   - Sensitivity calculation is done on the fly so you can add and remove targets at any time.



.. _addobs:

Add observation
+++++++++++++++

When the |icoobs|  button is clicked, the  "Add Observation" page as shown in :numref:`Figure %s <addobspage>` comes up.

.. _addobspage:

.. figure:: /images/observationSetup.png
   :width: 90%
   :align: center
   :alt: Image of the add observation page.

   The add observation page.



Actions
+++++++++++++++++++

.. |success| image:: /images/successIcon.png
   :width: 5%
   :alt: View icon


- **Link an observation to a target**: When an observation is selected by clicking on it, it can be linked by clicking the thick box of target. This triggers a request 
  to calculate the sensitivity results.

  The sensitivity calculator results for the linked target-observation can be seen by clicking on the |success| icon on the target section in status column. To see all the sensitivity 
  calculator results linked to an observation, click on the |success| icon on the observation section in the status column.


- **Edit an observation**: Available via the appropriate icon in the list of observations.  Once clicked, the selected observation is displayed in a
  form identical to the 'Add Observation page', with the titling of the form and buttons changed to reflect the different functionality
  upon completion.   
  

  Upon completion of this action, any affected Sensitivity Calculation results will be replaced, so it is encouraged to check that the
  results are still appropriate.   Also affected may be any Data Products, so these should also be checked to ensure suitability. While on this page, you can cancel the edit proess if you choose to.


- **Delete an observation**: Available via the appropriate icon in the list of observations.  Once clicked, a summary of the selected observation is displayed in a 
  modal and a confirmation of the action is required. Upon confirmation, the selected observation, together with all the links to targets 
  and data products is also removed.   If this action is cancelled, then the modal simply closes.

.. note:: 

   Observation Group

   - The user has the option to group observations together by adding them to a group.
   - The observation can be added to an existing group or a new group can be created.
   - Adding an observation to a group is optional.
   - Currently, once an observation has been added to a group, it can not be removed. Removal will be implemented at a later date



Next Steps
==========

After adding observation set(s) you can proceed to the "Technical" page or any other page. 

