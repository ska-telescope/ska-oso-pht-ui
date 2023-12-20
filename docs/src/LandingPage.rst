LandingPage
============
This is the first page seen by the user when opening the application.

It shows the user the list of proposals where he has participated as a Co-Investigator or Principal Investigator. The list is organised in a table, with an actions columns providing possible actions towards the proposal. 

There is also a button at the top of the table to create a new proposal.

EXISTING_PROPOSALS is an array of objects representing the proposals that are displayed on the Landing Page.


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

The filteredData variable is then updated by filtering the EXISTING_PROPOSALS array based on the searchTerm state. The filtered data is then passed to the DataGridWrapper component for display.


Filter Poposal by Status type
------------------------------
This dropdown menu allows the user to filter proposals by their status type. The available options are: "All Status Types" (default), and a list of status types defined in the application.

The filter dropdown menu is implemented using React state and the DropDown component from @ska-telescope/ska-gui-components. When the user selects an option from the dropdown menu, the setSearchType function updates the searchType state. The filteredData variable is then updated by filtering the EXISTING_PROPOSALS array based on both the searchTerm and searchType states. The filtered data is then passed to the DataGridWrapper component for display.

The SEARCH_TYPE_OPTIONS constant is defined in the constants.js file, and contains an array of objects representing the available status types. The filteredData variable is filtered based on whether the status property of each proposal object matches the searchType state, or if searchType is an empty string (representing no filter).

The DataGridWrapper component is from the @material-ui/data-grid package, while the DropDown and SearchEntry components are from the @ska-telescope/ska-gui-components package.

