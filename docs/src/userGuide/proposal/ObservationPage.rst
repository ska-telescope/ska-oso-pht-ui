Observation Page
~~~~~~~~~~~~~~~~
On entering the observation page for the first time, it will look like :numref:`Figure %s <obspage2>`. To add Observation(s), click the |icoobs| button (see :ref:`Add Observation section <obspage1>`). 



.. |iconsuccess| image:: /images/statusnav2.png
   :width: 5%
   :alt: success Icon

.. |icondelete| image:: /images/deleteicon.png
   :width: 6%
   :alt: delete Icon


.. |iconedit| image:: /images/editicon.png
   :width: 6%
   :alt: success Icon


.. |iconfailed| image:: /images/unacceptableicon.png
   :width: 4%
   :alt: Issues Icon



.. _obspage2:

.. figure:: /images/observationEmptyPage.png
   :width: 90%
   :align: center
   :alt: Image of the Observation page

   Image of the Observation page. 



.. |icoobs| image:: /images/obsbutton.png
   :width: 20%
   :alt: Page filter



.. _obspage1:
.. figure:: /images/observationPage.png
   :width: 90%
   :align: center
   :alt: Observation page with Observation(s) and target(s) added.

   Observation page with Observation(s) and target(s) added.



.. _editobservationpage:

.. figure:: /images/observationEntryContinuum.png
   :width: 90%
   :align: center
   :alt: Observation page to edit observation.

   Observation page to edit an observation.

.. _deleteobservationpage:

.. figure:: /images/deleteobservationpage.png
   :width: 90%
   :align: center
   :alt: Modal to edit an observation.

   Modal to delete an observation.




Layout and Navigation
=====================

The Observation Page consists of two distinct sections - see :numref:`Figure %s <obspage1>`:


1. **Left**:
   
   - Observation set table, which displays the following details :
  
     - **Id** : Unique id for each observation set.
     - **Group** : Group name if a given observation belongs to a group.
     - **Observing Band** : The observing band. The options are: 
  
                            - LOW band
                            - MID band 1
                            - MID band 2
                            - MID band 5a
                            - MID band 5b.
     - **Subrray** : The selected sub-array of the observation.
     - **Type** : Observation type i.e Continuum or Zoom.
     - **Status** : Indicates the overall status of the sensitivity calculation result for all targets linked to the observation. Click to open a modal with individual results - see :numref:`Figure %s <senscal>`. Status with:
  
                            - |iconsuccess| icon indicates that all sensitivity calculations for all targets were successful.
                            - |iconfailed| icon indicates there are one or more failed sensitivity calculation request.
     - **Actions** : 
                            - |iconedit| icon allows an observation to be edited as shown in  :numref:`Figure %s <editobservationpage>`. This is identical to the 'Add Observation' page but the difference is 'Update' at the bottom of the page instead of 'Add'. Upon completion of this action, any affected Sensitivity Calculation results will be replaced, so it is encouraged to check that the results are still appropriate. 
                            - |icondelete| icon provides the ability to delete ( after confirmation ) the selected observation. Once clicked, a summary of the selected observation is displayed as seen in :numref:`Figure %s <deleteobservationpage>`.  Upon confirmation, the selected observation, together with all the links to targets and data products will be removed. 


1. **Right**: 
   
   - Target List: 
   
     - Select targets associated with the chosen observation by ticking the checkboxes. Use "Selected" and "Not Selected" buttons for filtering.
     - The status of each linked target-observation sensitivity Calculation for that target. Status with:
  
                                  - |iconsuccess| icon indicates that the sensitivity calculations for that targets was successful. Clicking this will display the target level results from the sensitivity calculator.
                                  - |iconfailed| icon indicates that sensitivity calculation request failed. Hovering over this will display the error.
     - The *weighted sensitivity* based on the sensitivity calculator result. Only appears after the target is linked to an observation.
     - The *beam size* based on the sensitivity calculator result. Only appears after the target is linked to an observation.



.. _senscal:

.. figure:: /images/obssenscal.png
   :width: 90%
   :align: center
   :alt: Sensitivity calculator result modal display.

   Sensitivity calculator observation level result modal display.

.. tip:: 

   - Link an observation to a target: When an observation is selected by clicking on it, it can be linked to a target by clicking the check box next to the target name on the right. This triggers a request to calculate the sensitivity/integration time.
   - Sensitivity calculation is done on the fly so you can add and remove targets at any time.



.. _addobs:

Add observation
+++++++++++++++

When the |icoobs|  button is clicked, the  "Add Observation" page as shown in :numref:`Figure %s <addobspage>` comes up. After filling and adding this page, it will be added on the observation table.

.. _addobspage:

.. figure:: /images/observationSetup.png
   :width: 90%
   :align: center
   :alt: Image of the add observation page.

   The add observation page.




Key Information and Actions
===========================

The Observation Page allows you to:

  - Create new observation entries.
  - Group observations.
  - Link observations to specific targets.
  - Manage observation list.
  - View the Sensitivity Calculator results at individual target level and at observation level.




|helpdesk|