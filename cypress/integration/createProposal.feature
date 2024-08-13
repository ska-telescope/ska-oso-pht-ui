Feature: Creating proposals

  @XTP-59739
  Scenario: Create a basic proposal
  Given I am a PHT user who wants to create a proposal
  When I provide a title and select the proposal category
  Then a proposal with unique ID is created and I can see that on the landing page