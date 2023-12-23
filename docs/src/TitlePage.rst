TitlePage
============
This page allows the user to create a new proposal by selecting a proposal type and a sub-proposal type. 

The user can also enter a title for the new proposal.

Title
------
This field allows the user to enter a title for the new proposal. 
The title should be used to identify the proposal in a list of proposals. 
The user can only enter alphanumeric characters, spaces, and some special characters. 
The maximum length of the title is specified in MAX_TITLE_LENGTH constant.

Proposal Type
--------------
This section displays a list of available proposal types that can be used as a basis for a new proposal. 
The user can select a proposal type by clicking on the corresponding card. 
The card displays the proposal code, title, and description. 
If the user selects a different proposal type after already having selected a sub-proposal type, they will be prompted to confirm whether they want to discard the current sub-proposal.

Sub-Proposal Type
------------------
This section displays a list of available sub-proposal types for the selected proposal type. 
The user can select a sub-proposal type by clicking on the corresponding card. 
The card displays the sub-proposal code, title, and description. 
If the user selects a different sub-proposal type after already having selected one, they will be prompted to confirm whether they want to discard the current sub-proposal.

AlertDialog
------------
This component is used to display a confirmation dialog when the user selects a different proposal type or sub-proposal type. 
The dialog asks the user whether they want to continue with the new selection or discard their changes. 
The user's response is passed to the handleDialogResponse function, which updates the state accordingly.

TextField
-----------
This component is used to display the Title field. It allows the user to enter the title for the new proposal. 
The value of the field is stored in the TheTitle state. When the user types in the field, the validateTheTitle function is called to validate the input. 
If the input is valid, the error state is set to false, and the helperText state is cleared. 
If the input is not valid, the error state is set to true, and the helperText state displays an error message.

Projects
---------
This constant is an array of objects representing the available proposal types and sub-proposal types. 
Each object contains a code, title, and description property. 
The available proposal types are displayed as cards in the Proposal Type section, while the available sub-proposal types for the selected proposal type are displayed as cards in the Sub-Proposal Type section.

Avatar, Button, Card, CardActionArea, CardHeader, Grid, Tooltip, and Typography
---------------------------------------------------------------------------------
These are components from the Material-UI library used to display the cards and text on the page. 

The Card component is used to display each proposal type and sub-proposal type as a card with a code, title, and description. 

The CardHeader component is used to display the code and title of each card. 

The Tooltip component is used to display the description of each card when the user hovers over the title. 

The Avatar component is used to display the proposal code as an icon on each card. 

The Grid component is used to arrange the cards in a grid layout. 

The Typography component is used to display text on the page.