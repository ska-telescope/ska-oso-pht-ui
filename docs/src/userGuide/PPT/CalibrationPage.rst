Calibration Page
================

You need to have observations and targets added to your proposal to see the calibration strategy. 
The calibration page allows you to view the observatory defined calibration strategy for an observation and target combination. 

.. figure:: /images/calibrationPage.png
   :width: 90%
   :align: center
   :alt: Image of the calibration page.

   Image of the calibration page.

Layout and Navigation
++++++++++++++++++++++

The calibration page is divided into several sections, each providing different functionalities:

1. **Calibrator pre-processing**: Displays the calibrator selected for pre-processing the observation data. This includes:
   - Calibrator Name: The name of the calibrator.
   - Duration: The duration (in minutes) for which the calibrator is used.
   - Intent: The purpose of the calibration (e.g., phase, amplitude).

2. **Target name and integration time of the observation**: This section shows:
   - Target Name: Automatically retrieved from the proposal based on the selected observation.
   - Integration Time: The total integration time (in minutes) for the selected observation, derived from the supplied sensitivity parameters.

3. **Calibrator post-processing**: Displays the calibrator used after the observation. This section mirrors the pre-processing calibrator fields (name, duration, intent) and is currently assumed to be the same as the pre-processing calibrator.

4. **Comments and Notes**: 
   - Add Note Checkbox: Allows users to indicate whether they want to include a comment.
   - Comment Field: A multi-line text field for entering additional notes or justifications related to the calibration strategy.
   - Validation: If the checkbox is selected, the comment field becomes mandatory.



|helpdesk|