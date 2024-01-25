Landing Page
=============
This is the first page seen by the user when opening the application.

It shows the user the list of proposals where he has participated as a Co-Investigator or Principal Investigator. The list is organised in a table, with an actions columns providing possible actions towards the proposal. 

There is also a button at the top of the table to create a new proposal.

View Proposal
-------------
This button allows the user to view the details of a selected proposal.

To Be Implemented once API endpoint ready.

Edit Proposal
--------------
This button allows the user to edit the details of a selected proposal.

To Be Implemented once API endpoint ready.

Clone Proposal
--------------
This button allows the user to create a copy of a selected proposal.

To Be Implemented once API endpoint ready.

Download Proposal
-----------------
This button allows the user to download a selected proposal.

Delete Proposal
---------------
This button allows the user to delete a selected proposal.

To Be Implemented once API endpoint ready.

Search Proposal
----------------
This search bar allows the user to search for proposals by title.

The search bar is implemented using React state and the SearchEntry component from @ska-telescope/ska-gui-components. When the user types in the search bar, the setSearchTerm function updates the searchTerm state. 

The filteredData variable is then updated by filtering the array based on the searchTerm state. The filtered data is then passed to the DataGridWrapper component for display.


Filter Proposal by Status type
------------------------------
This dropdown menu allows the user to filter proposals by their status type. The available options are: "All Status Types" (default), and a list of status types defined in the application.

The filter dropdown menu is implemented using React state and the DropDown component from @ska-telescope/ska-gui-components. When the user selects an option from the dropdown menu, the setSearchType function updates the searchType state. The filteredData variable is then updated by filtering the array based on both the searchTerm and searchType states. The filtered data is then passed to the DataGridWrapper component for display.

The SEARCH_TYPE_OPTIONS constant is defined in the constants.js file, and contains an array of objects representing the available status types. The filteredData variable is filtered based on whether the status property of each proposal object matches the searchType state, or if searchType is an empty string (representing no filter).

The DataGridWrapper component is from the @material-ui/data-grid package, while the DropDown and SearchEntry components are from the @ska-telescope/ska-gui-components package.


GET Proposal
-------------------
Clicking on the view icon in the data table will do a request to the API GET proposal endpoint.
An Alert component is displayed at the top of the page with the result of the request.


GET Proposal
-------------------
Clicking on the view icon in the data table will do a request to the API GET proposal endpoint.
An Alert component is displayed at the top of the page with the result of the request.

GET Proposal/list
------------------------------
The data can now be returned from the API from the GET proposal/list endpoint to display the list of proposals.

As the format of the data is currently different to what's returned in the front-end, this will currently show an error message in a Alert component wit the text:
"Unexpected data format returned from API"

There is the option to turn on/off the API call with REACT_APP_USE_LOCAL_DATA: in env.js. If set to true, the service will use the local mockProposals file and will not do a request.


PUT Proposal
------------------------------
Clicking on the edit icon in the data table will do a request to the API PUT proposal endpoint.

An Alert component is displayed at the top of the page with the result of the request.

GET Proposal/list
------------------------------
The data can now be returned from the API from the GET proposal/list endpoint to display the list of proposals.

As the format of the data is currently different to what's returned in the front-end, this will currently show an error message in a Alert component wit the text:
"Unexpected data format returned from API"

There is the option to turn on/off the API call with REACT_APP_USE_LOCAL_DATA: in env.js. If set to true, the service will use the local mockProposals file and will not do a request.


PUT Proposal
------------------------------
Clicking on the edit icon in the data table will do a request to the API PUT proposal endpoint.

An Alert component is displayed at the top of the page with the result of the request.


POST Proposal/validate
------------------------------
Clicking on the Validate buton on the banner will do a request to the API POST proposal/validate endpoint.

An Alert component is displayed next to the button with the result of the request.


GET coordinates
------------------------------
Clicking on the Resolve buton in the add target form will do a request to the API GET coordinates/{targetName} endpoint 
to retrieve the coordinates of the names target.

An Alert component is displayed next to the button if the request fails.