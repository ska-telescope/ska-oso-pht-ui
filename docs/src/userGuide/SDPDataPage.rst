Observatory Data Product Page
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Data Products are associated to one or more Observation Set(s) which have a valid association to a target with resultant sensitivity calculation results.

Here, you can request a single or multiple observatory data products for an observation set or all observation sets added to your proposal.
The "Add Data Product" function is not active until an observation set exists, has been linked to a target and has a valid Sensitivity Calculation Result. :numref:`Figure %s <datapageextra>` shows the layout of the observatory data product data page when no data product has been added to observation set(s).

Key Information and Actions
===========================

- View data products added to observation set(s).
- Add new data products.
- Delete data products.
- If no observation is added to your proposal yet, the |icosdp| button will be deactivated.

.. |icosdp| image:: /images/addsdp.png
   :width: 20%
   :alt: Page filter


.. _datapageextra:

   .. figure:: /images/dataProductPage.png
      :width: 100%
      :alt: Image of the Observatory Data Product page. 

   Figure : Observatory Data Product page.

Layout and Navigation
=====================

The are two parts to the observatory data product page:

1. **Landing page**


   To add observatory data product to an observation, click the  |icosdp| button. Once data products 
   have been added to your observation set(s), the observatory data product landing page will 
   display a table as shown in :numref:`Figure %s <datapage1>`. This table displays the following:

      - *Observation set(s)*: Observation set selected for which the observatory data product(s) is added.
      - *Observatory Data Products*:  A list of added data products(s).
      - *Image Size*: Image size requested.
      - *Pixel Size*: Pixel size calculated based on the beam size returned from the sensitivity calculator =  :math:`\frac{\theta_{minor}}{3}`.
      - *Weighting*: The weighting of the selected observation set.
      - *"Actions"* : "Delete" is the only option available at the moment.


.. _datapage1:

.. figure:: /images/sdpdata1.png
   :width: 90%
   :alt: Image of the Observatory Data Product page with data products added. 

   Observatory Data Product page with data products added.



Below is the list of Observatory Data Products as available at this time

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


Next Steps
==========

After successfully adding Observatory Data Products, you can move to the "SrcNet" page or any other page.



