Introduction
~~~~~~~~~~~~


The Proposal Preparation Tool (PPT) allows you to prepare and submit a proposal to the Square Kilometer Array Observatory `(SKAO) <https://www.skao.int/en>`_. 

The PPT supports both light and dark modes and can be accessed at the top right corner of the application through the |icostatus| icon.

When using the tool as a non-logged in user, functionality is restricted to only the target and observation page.



.. |icostatus| image:: /images/sunMoonBtn.png
   :width: 5%
   :alt: Page filter

.. |icostatus2| image:: /images/statusnav2.png
   :width: 5%
   :alt: complete status

.. |icostatus3| image:: /images/statusnav1.png
   :width: 5%
   :alt: incomplete status

.. |icostatus4| image:: /images/statusnav3.png
   :width: 5%
   :alt: Not started status

.. |icostatus5| image:: /images/unacceptableicon.png
   :width: 4%
   :alt: Failed validation status



.. _statnavtest:
.. figure:: /images/statusnav.png
   :width: 95%
   :align: center
   :alt: Status, navigation, and validation displayed at the top of each page in a proposal.

   Status, Navigation and Validation displayed at the top of each page in a proposal.


Common Elements Overview:
=========================
Common elements are recurring components found across multiple pages in the tool. They provide consistency and familiarity as they navigate through different sections. Below is an overview of the common elements that you will encounter throughout the PPT. 


.. csv-table:: Common elements and description
   :align: center
   :header: "Element", "Description"

   
   "Status Indicators",	"Displayed at the top of the page. It shows the validation status as seen in :numref:`Figure %s <statnavtest>`  on each page in the flow. 
   Additionally, :numref:`Figure %s <statnavtest>` provides navigation and status of each page. 
         * |icostatus2| represents a complete and validated page. 
         * |icostatus3| represents an incomplete page. 
         * |icostatus4| represents a page that is not started (Only visible during the creation of a new proposal). 
         * |icostatus5| a page that has one or more failed field validations." 
   "Home Button", "Positioned at the top left corner (see :numref:`Figure %s <statnavtest>`), enabling you to return to the :doc:`Landing Page </userGuide/LandingPage>`."
   "Save Button",	"Located at the top left corner (see :numref:`Figure %s <statnavtest>`), next to the home button, allowing the progress of a proposal to be saved."
   "Validate Button",	"Positioned at the top right (see :numref:`Figure %s <statnavtest>`) of the page. This allows a proposal to be validated against the capabilities of a current cycle."
   "Submit Button",	"Located at the top right corner (see :numref:`Figure %s <statnavtest>`) of the page. This buttons only becomes active after a proposal passes validation."
   "Dynamic Help", "Always on the right side of the page. Hovering over fields provides contextual descriptions and guidance for elements across all pages."




.. admonition:: Please note

   This is an MVP version of PPT which offers a subset of the functionalities planned. At the moment, one can 

     - Create, view, and edit proposals.
     - Specify individual targets or upload a list of targets in ICRS.
     - Define observation sets.
     - Add Observatory data products (Currently under development, with full functionality coming soon.)


|footer|