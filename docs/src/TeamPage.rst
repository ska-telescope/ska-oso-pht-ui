Team Page
=============
This page is responsible for displaying the team members involved in a proposal.


Team Table
-------------
Displays the list of team members. 

The PI column displays a grey star icon if the team member is the Principal Investigator of the proposal. 

For non PI members, a bordered star is displayed if the invitation has been accepted.

If the invitation is pending, no star is displayed.


Invite Team Member
--------------------

The user can invite new members by filling the form. 

Information required is: first name, last name, email address and an optional check box for Principal Investigator.


Syntax check
--------------
The input fields of the form are checked for correct syntax, allowing only alpha-numeric characters and some limited special characters.

The email address checks for a valid email format.

Errors messages are displayed under the inputs in case of incorrect syntax.


Form Validation
------------------
The form button is disabled by default.

The form validation logic checks that there are no syntax issues and that no input fields are left empty.

If all these conditions are met, the "Send Invitation" button is enabled.

No error message is displayed for empty fields, however the button will stay disabled.


Add Team Member
-----------------
Once the form has been validated and the button clicked, the data table will display the new team member with a pending status.

The input fields are then cleared.



