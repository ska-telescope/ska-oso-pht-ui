Observation Page
~~~~~~~~~~~~~~~~

This guide explains the “Observation Page”, where you seamlessly define your observation needs.

.. figure:: /images/observationPage.png
   :width: 90%
   :alt: screen in light & dark mode 

Layout and Navigation
=====================

The Observation Page consists of two distinct sections:

1. Observation List and Target Selection:

- Left side:

  - Add Observation: Click this button to create a new observation entry.
  - Observation List: View a table summarizing existing observations with details like array, type, Sensitivity Calculation Summary and actions (delete).
  - The observation list also displays the group Id if a given observation belongs to a group.

- Right side:

  - Target List: Select targets associated with the chosen observation by ticking the checkboxes. Use "Selected" and "Not Selected" buttons for filtering.
  - The status icon next to each linked target-observation shows the status of a Sensitivity Calculation.

.. admonition:: Sensitivity Calculation Display

   Further details of this can be found in the appropriate section of this guide

   
2. Observation Mode Details:

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

.. figure:: /images/sensitivityCalculatorModal.png
   :width: 90%
   :alt: screen in light & dark mode 

Navigation Elements
===================

- Home: (Top left corner) Returns you to the Landing Page.
- Target Page: (Bottom left corner) Takes you back to the Target Page.
- Save: (Top left) Saves your progress on the Observation Page.
- Validate: (Top right) Checks if all required information is filled correctly.
- Submit: (Top right corner, initially grayed out) Becomes clickable only when all proposal details are entered and validated.
- Technical: (Bottom right corner) Moves you to the next page for Technical Justification details.

Additional Features
===================

- SKAO Standard Header and Footer: Provides branding and navigation to other resources.
- Sun/Moon Mode Toggle: (Top right corner) Adjusts the page contrast for accessibility.

.. figure:: /images/sunMoonBtn.png
   :width: 5%
   :alt: light/dark Button

.. figure:: /images/observationPage.png
   :width: 90%
   :alt: screen in light & dark mode 
   
- A status indicator at the top shows the validation status of each page in the flow.
- Each status indicator, when clicked, will navigate to the appropriate page

.. figure:: /images/pageStatus.png
   :width: 90%
   :alt: page status icons/navigation

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

Additional Notes
================

- This guide assumes you're already logged in to PPT.
- The content remains the same regardless of your user context.
- Dynamic help is available, when you hover over fields, for descriptions. 
- Remember to save your progress regularly using the "Save" button.
- The "Submit" button will only become active when all required information is entered and validated.

.. admonition:: Confirmation Summary

   Before submitting your details, ensure everything is correct by clicking 'Validate'. Clicking 'Submit' after that will bring up a Confirmation Page summarizing your details. Review and click 'Confirm' to proceed or 'Cancel' to make changes.
