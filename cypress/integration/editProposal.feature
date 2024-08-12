Feature: Editing proposals

  Scenario: Edit a basic proposal
  Given I am a PHT user who wants to continue editing my previously created proposal
  When I get on the landing page and click on the edit button
  Then I am able to continue my proposal from where I stopped, fill in all the necessary details
  And I validate my proposal
  And I submit my proposal
  And the proposal status should change to submitted