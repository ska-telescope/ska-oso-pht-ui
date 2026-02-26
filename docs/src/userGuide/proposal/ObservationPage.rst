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

The Observation Page consists of the Observation set table, which displays the following details :

   - **Actions** :   

      - |iconedit| icon allows an observation to be edited as shown in  :numref:`Figure %s <editobservationpage>`. This is identical to the 'Add Observation' page but the difference is 'Update' at the bottom of the page instead of 'Add'. Upon completion of this action, any affected Sensitivity Calculation results will be replaced, so it is encouraged to check that the results are still appropriate. 
      - |icondelete| icon provides the ability to delete ( after confirmation ) the selected observation. Once clicked, a summary of the selected observation is displayed as seen in :numref:`Figure %s <deleteobservationpage>`.  Upon confirmation, the selected observation, together with all the links to targets and data products will be removed. 
   
   - **Type** : Observation type i.e Continuum or Zoom.
   - **Id** : Unique id for each observation set.
   - **Group** : Group name if a given observation belongs to a group.
   - **Subarray** : The selected sub-array of the observation.
   - **Band** : The observing band. The options are : 

      - LOW band
      - MID band 1
      - MID band 2
      - MID band 5a
      - MID band 5b.

   - **Frequency Range** : Displays the frequency range of the observation, with the central frequency in the colored section.

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
  - Manage observation list.

|helpdesk|