Persistent Environments
=========================

.. _persistent_environments:

Similar to other applications, there are several deployments of the application via CI/CD pipelines.

Integration
-----------

The integration environment deploys the **latest main branch version** of the application, and is triggered by every
commit to the main branch. It should always be available at

https://k8s.stfc.skao.int/integration-ska-oso-pht-ui/pht/

Staging
-------

The integration environment deploys the **latest released branch version** of the application, and is triggered by every
commit to the main branch. It should always be available at

https://k8s.stfc.skao.int/staging-ska-oso-pht-ui/pht/

ska-oso-integration
-------------------

`ska-oso-integration <https://developer.skao.int/projects/ska-oso-integration/en/latest/?badge=latest>`_ is a separate environment
deployed by its own pipeline for stable, released versions of OSO services that are integrated with the other OSO applications.

