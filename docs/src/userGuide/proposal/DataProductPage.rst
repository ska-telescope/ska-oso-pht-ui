Observatory Data Product Page
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Data Products are associated to one or more Observation(s) which have a valid association to a target with resultant sensitivity calculation results. Here, you can request a single or multiple observatory data products for an observation set added to your proposal. The |icosdp| button is not active until an observation exists, has been linked to a target and has a valid Sensitivity Calculation Result. 
:numref:`Figure %s <figure50>` shows the layout of the observatory data product page when no data product has been added to Observation(s).

.. |icosdp| image:: /images/addsdp.png
   :width: 20%
   :alt: Page filter


.. _figure50:

.. figure:: /images/dpList.png
   :width: 100%
   :alt: Image of the Observatory Data Product page. 

   Observatory Data Product page.



Key Information and Actions
===========================

- View data products added to observation set(s).
- Add new data products.
- Delete data products.
- If no observation is added to your proposal yet, the |icosdp| button will be deactivated.



Layout and Navigation
=====================

The are two parts to the observatory data product page:

1. **Landing page**


   To add observatory data product to an observation, click the  |icosdp| button. Once data products 
   have been added to your Observation(s), the observatory data product landing page will 
   display a table as shown in :numref:`Figure %s <datapage>`. This table displays the following:

      - *Observation(s)*: Observation set selected for which the observatory data product(s) is added.
      - *Observatory Data Products*:  A list of added data products(s).
      - *Image Size*: Image size requested.
      - *Pixel Size*: Pixel size calculated based on the beam size returned from the sensitivity calculator =  :math:`\frac{\theta_{minor}}{3} arcsec`.
      - *Weighting*: The weighting of the selected observation set.
      - *"Actions"* : "Delete" is the only option available at the moment.


.. _datapage:

.. figure:: /images/sdpdata1.png
   :width: 90%
   :alt: Image of the Observatory Data Product page with data products added. 

   Observatory Data Product page with data products added.



Below is the list of Observatory Data Products available at present:

      - Image Products 1 : Image Cubes
      - Image Products 2 : UV Grids
      - LSM Catalogue
      - Visibilities


  

2. **Data Product Management**

- Clicking on the |icosdp| button takes the user to a page where parameters of the 
  data product(s) can be specified as shown in :numref:`Figure %s <datapage2>`

.. _datapage2:

.. figure:: /images/sdpdata2.png
   :width: 90%
   :alt: Image of the Observatory Data Product management page 

   Observatory Data Product management page.


Key Information and Actions
===========================

- View data products added to Observation(s).
- Add new data products.
- Delete data products.
- If no observation is added to your proposal yet, the |icosdp| button will be deactivated.





|helpdesk|