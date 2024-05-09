Sensitivity Calculation Display
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This guide explains the available display of Sensitivity information that is available via the "Observation Page".

Target level Sensitivity Calculation
====================================

This is located as part of the Target list located on the right side of the Observation page.

When an observation is selected, any targets in the list that have been identified as being linked
to that observation will have Sensitivity Calculation applied to them and the results displayed.
In the list this is represented by a status icon, followed by the Total Sensitivity and the Integration
time.

.. admonition:: Error in Sensitivity Calculation results

   If there is an error reported in the Sensitivity results, this will be displayed in stead of the Total
   Sensitivity and Integration times, and the Status Icon will indicate an Error result.

Target Level Sensitivity Calculation Details
--------------------------------------------

Clicking on the Status Icon within the target list will allow the modal to be displayed if available.
This shows further details of the Sensitivity calculation results appropriate to the Observation & Target
selected

.. figure:: /images/sensitivityCalculatorModal.png
   :width: 90%
   :alt: screen in light & dark mode 

Observation level Sensitivity Calculation
=========================================

This is located as part of the Observation list located on the left side of the Observation page.

A Status icon is displayed which indicates the overall status of all Sensitivity calculations that are
relevant to the observation as a summary of all calculations applied to the associated targets.

.. admonition:: Status Icon display

   Assuming that all calculations are successful, the status displayed will indicate the success. 
   If any fail for any reason, then the status displayed will be that of an error.

Observation Level Sensitivity Calculation Details
-------------------------------------------------

Clicking on the Status Icon within the Observation list will allow the modal to be displayed.
This shows a table of the targets associated to the selected observation, together with a status indication
for each target, allowing any resulting in a calculation error to be easily identified

In the top left of the modal is a display of the overall status level fir convenience, and the Id of
the observation has been included as part of the title

.. figure:: /images/sensitivityCalculatorModal.png
   :width: 90%
   :alt: screen in light & dark mode 
