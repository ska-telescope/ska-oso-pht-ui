Feature: Creating observations

  Scenario: Create a standard observation
    Given I have access to the PHT Application
    And I create a proposal
    And I have navigated to the General Page
    And I have navigated to the Science Page
    And I have navigated to the Target Page
    And I have navigated to the Observation Page

  Scenario: Create and verify LOW Continuum observation sensitivity calculator results
    Given I have access to the PHT Application
    And I create a proposal
    And I have created an M2 target
    And I have navigated to the Observation Page
    When I create a LOW Continuum observation using default values
    And I have a LOW Continuum observation linked with an M2 target
    And I click to view sensitivity calculator results
    Then the sensitivity calculator results for a LOW Continuum observation are valid