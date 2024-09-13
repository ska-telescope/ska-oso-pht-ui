Feature: Creating observations

  Scenario: Create a standard observation
    Given I have access to the PHT Application
    And I have navigated to the Observation Page

  Scenario: Create and verify LOW Continuum observation
    Given I have access to the PHT Application
    And I have navigated to the Observation Page
    When I create a LOW Continuum observation using default values
    Then the sensitivity calculator results for a LOW Continuum observation are valid