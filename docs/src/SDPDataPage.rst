Observatory Data Product Page
==================================


The observatory data product page is linked with the observation page so observation sets can be specified for which a data product is requested. 
Here, you can request a single or multiple observatory data data products for an observation set or all observation sets added to your proposal.
The "Add Data Product" will not be active until an observation set exists, has been linked to a target and has a valid sensitivity Calculation Result. :numref:`Figure %s <_datapageextra>` shows the layout of the observatory data product data page in light mode when no data product has been added to observation set(s).


.. |icosdp| image:: /images/addsdp.png
   :width: 20%
   :alt: Page filter


.. _datapageextra:

.. figure:: /images/dataProductPage.png
   :width: 100%
   :alt: Observatory data page in screen in light mode 

   Figure : Observatory Data Product page in light mode.

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
      - *Pixel Size*: Pixel size  calculated based on the beam size returned from the sensitivity calculator =  :math:`\frac{\theta_{minor}}{3}`.
      - *Weighting*: The weighting of the selected observation set.
      - *"Actions"* : "Delete" is the only option available at the moment.



.. _datapage1:

.. figure:: /images/sdpdata1.png
   :width: 90%
   :alt: Observatory Data Product page in screen in light mode 

   Observatory Data Product page in light mode with data products added.


  

1. **Data Product Management**

- Clicking on the |icosdp| button takes the user to a page where parameters of the 
  data product(s) can be specified as shown in :numref:`Figure %s <datapage2>`

.. _datapage2:

.. figure:: /images/sdpdata2.png
   :width: 90%
   :alt: Observatory Data Product management page screen in light mode 

   Observatory Data Product  management page in light mode.


Key Information and Actions
===========================

- View data products added to observation set(s).
- Add new data products.
- Delete data products.
- If no observation is added to your proposal yet, the |icosdp| button will be deactivated.

Next Steps
==========

After successfully adding Observatory Data Products, you can move to the "SrcNet" page or any other page.



