Introduction
~~~~~~~~~~~~


The Proposal Handling Tool (PHT) allows you to prepare and submit a proposal to the Square Kilometer Array Observatory (SKAO). The tool is guided so allows both seasoned and new astronomers to submit a scientific proposal.

The PHT supports both light and dark modes and can be accessed at the top left corner |icostatus| of your screen - see :numref:`Figure %s <figure1>`.



.. |icostatus| image:: /images/sunMoonBtn.png
   :width: 10%
   :alt: Page filter

.. |icostatus2| image:: /images/statusnav1.png
   :width: 20%
   :alt: complete status

.. |icostatus3| image:: /images/statusnav2.png
   :width: 20%
   :alt: incomplete status

.. |icostatus4| image:: /images/statusnav3.png
   :width: 20%
   :alt: Not started status

.. |icostatus5| image:: /images/statusnav4.png
   :width: 20%
   :alt: Failed validation status

.. _figure1:
.. figure:: /images/toggle.png
   :width: 100%
   :alt: Image showing the location of light/dark mode toggle of the PPT
   :class: with-border

   Location of light/dark mode toggle of the PPT.





Common Elements Overview:
=========================
Common elements are recurring components found across multiple pages in the tool. They provide consistency and familiarity as they navigate through different sections. Below is an overview of the key common elements that you will encounter throughout the PPT. 


.. csv-table:: Common elements and description
   :header: "Element", "Description"

   "Status Indicators",	"Displayed at the top of the page. It shows the validation status as seen in :numref:`Figure %s <figure2>`  on each page in the flow." 
   "Home Button", "Positioned at the top left corner, enabling you to return to the Landing Page."
   "Save Button",	"Located at the top left corner, next to the home button, allowing you to save your progress on each page."
   "Validate Button",	"Positioned at the top right. This allows your proposal to the validated against the capabilities of a current cycle."
   "Submit Button",	"Found at the top right corner. This buttons only becomes active after your proposal is validated."
   "Dynamic Help", "Always on the right side of the page. Hover over fields provide contextual descriptions and guidance for elements on all pages."


.. _figure2:

.. figure:: /images/statusnav.png
   :width: 100%
   :align: center
   :alt: Image of Status, Navigation and Validation.

   Status, Navigation and Validation.


Additional Notes
================

- You need to be logged in to access the landing page :numref:`Figure %s <landpage>`  and its features.

.. _landpage:

.. figure:: /images/landingPage.png
   :width: 90%
   :align: center
   :alt: Image of the Landing page.

   Landing page.

Additionally, :numref:`Figure %s <figure2>` provides three functions which are navigation, status and validation of each page as outlined below.

- |icostatus2| represents a complete and validated page.
- |icostatus3| represents an incomplete page. 
- |icostatus4| represents a page that is not started (Only visible during the creation of a new proposal).
- |icostatus5| a page that has one or more failed field validations.

.. admonition:: Please note

   This is an MVP version of PPT, meaning it offers a subset of the functionalities planned for the future. However, it allows you to submit a proposal for a continuum observation.
