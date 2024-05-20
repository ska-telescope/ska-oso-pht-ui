SDP Data Page
~~~~~~~~~~~~~

The SDP (Science Data Processor) page is linked with the observation page so observation sets can be specified for which a data product is requested. Here, you can request a single or multiple SDP data products for an observation set or all observation sets added to your proposal.
The "add observation" will not be active until and observation set exist and has been linked to a target. :numref:`Figure %s <datapage>` shows the layout of the SDP data page in light mode when no data product has been added to observation set(s) but observation sets and targets have linked on the observation page.


.. |icosdp| image:: /images/addsdp.png
   :width: 20%
   :alt: Page filter


.. _datapage:

.. figure:: /images/dataProductPage.png
   :width: 100%
   :alt: SDP data page in screen in light mode 

   Figure : SDP data page in light mode.

Layout and Navigation
=====================

The are two parts to the SDP data page:

1. **Landing page**


To add SDP data products to an observation, click the  |icosdp| button. Once data products 
have been added to your observation set(s), the SDP data landing page will 
display a table as shown in :numref:`Figure %s <datapage1>`. This table displays the following:

  - *Observation set(s)*: Observation set selected for which the sdp data product(s) is added.
  - *Observatory Data Product*:  A list of selected data products(s).
  - *Image Size*: Image size requested.
  - *Pixel Size*: Pixel size  caluclated based on the beam size returned from the sensitivity calculator =  :math:`\frac{\theta_{minor}}{3}`.
  - *Weighting*: The weighting of the selected observation set.
  - *"Actions"* : "Delete" is the only option available at the moment.



.. _datapage1:

.. figure:: /images/sdpdata1.png
   :width: 90%
   :alt: SDP page in screen in light mode 

   SDP data page in light mode with data products added.


  

2. **Data Product Management**

- Clicking on the |icosdp| button takes the user to a page where parameters of the 
  data product(s) can be specified as shown in :numref:`Figure %s <datapage2>`

.. _datapage2:

.. figure:: /images/sdpdata2.png
   :width: 90%
   :alt: SDP data management page screen in light mode 

   SDP data management page in light mode.


Key Information and Actions
===========================

- View data products added to observation set(s).
- Add new data products.
- Delete data products.
- If no observation is added to your proposal yet, the |icosdp| button will be deactivated.

Next Steps
==========

After successfully adding SDP data products, you can move to the "SRC Net" page or any other page.



