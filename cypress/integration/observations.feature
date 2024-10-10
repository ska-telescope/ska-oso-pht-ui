Feature: Creating observations

  Scenario: Create a standard observation
    Given I have access to the PHT Application
    And I have navigated to the Observation Page

  Scenario: Verify spectral average limits
    Given I have access to the PHT Application
    And I have navigated to the Observation Page
    When I begin to add an observation setup
    Then I verify spectral average limits for LOW Continuum observations
    And I verify spectral average limits for LOW Zoom observations