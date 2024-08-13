Feature: PHT user journeys

  @XTP-59739
  Scenario: Verify dark mode
    Given I navigate to the website
    When User clicks on the dark mode button
    Then Dark mode is available