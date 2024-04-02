Sensitivity Calculator API
~~~~~~~~~~~~~~~~~~~~~~~~~~

Each target that is selected in relation to an observation attempt to connect to the Sensitivity Calculator API.
The GetSensitivityCalculatorAPIData service acts as the entry point to the different API requests to the Sensitivity Calculator and handles 
the appropriate number of requests to the endpoints as necessary.

Currently, the Observation data is passed to the Sensitivity Calculator Service and sent to the Calculate endpoint and Weighting end point.
However, the target data is still mocked for both Calculate and Weighting.

There are 2 or 3 calls to the API endpoints made every time.

    Continuum Modes (Low or Mid): 
    - 1 call to getCalculate - with Continuum parameter
    - 1 call to GetWeighting - with Continuum parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

    Zoom Modes (Low or Mid): 
    - 1 call to getCalculate - with Zoom parameter
    - 1 call to GetWeighting - with Zoom parameter (weightingLine)

Services
========

The 3 services used for the Sensitivity calculators are:
- GetCalculate service
- GetWeighting service
- GetSensitivityCalculatorAPIData

Endpoints
=========

There a 2 main endpoints: 
- getCalculate
- getWeighting

These are called with different parameters depending on telescope (Mid, Low) and Mode (Continuum, Zoom).

Responses
=========

In the responses, some results are used directly like the confusion noise, 
and some are combined and used for some calculations in the Sensitivity Calculator front-end.