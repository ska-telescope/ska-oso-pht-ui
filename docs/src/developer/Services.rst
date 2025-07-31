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
The data is stored in folders under public/locales, with each language in its own folder ( e.g. en ).
In this application, all the json files needed to be called pht.json

axios
=====

.. csv-table:: axios endpoints
   :header: "Endpoint", "Type", "LocalData", "Parameters", "Purpose"

    "Proposal/list", "GET", "MockProposalBackendList", "current user", "A list of proposals that the user is involved with is obtained from the API"
    "Proposal", "GET", "MockProposalBackend", "proposal Id", "Complete details of a single proposal is obtained from the API"
    "Proposal", "PUT", "", "", "Complete details of a proposal are sent to the API for storage"
    "Proposal/validate", "POST", "TBD", "TBD", "A request to validate the proposal is requested of the API, which return validation results"
    "coordinated", "GET", "TBD", "Point of reference", "The API is asked to supply the coordinate information for the provided point of reference"
    "/osd{cycle}", "GET", "MockObservatoryDataBackend", "cycle", "Observatory data is obtained from the API"


.. admonition:: REACT_APP_USE_LOCAL_DATA
    
    This is an option to turn on/off the API call and instead use mocked data.
