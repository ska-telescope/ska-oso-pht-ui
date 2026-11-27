Services
~~~~~~~~

Included are a number of services, which have also been implemented into the code, providing simple examples.
It is expected that in the main that there will be no updates to these services directly

theme
=====

Contains the initialization of the latest SKAO Theme.
The code for this has already been provided and ensures that styling adhere's to SKAO standards

i18n
====

Allows for text to be displayed in the language of the browser, with English as the default.
The data is stored in folders under src/locales, with each language in its own folder ( e.g. en ).
In this application, all the json files needed to be called pht.json or sv.json.

API
===

Calls to ska-oso-services are made through the API layer in ``src/services/api``, on the
generated OpenAPI client. See :doc:`ApiLayer`.
