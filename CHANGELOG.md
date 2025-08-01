Changelog
~~~~~~~~~

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

UNRELEASED
------------

* [BREAKING] Changed build system from Webpack to Vite
* PHT-Services changed to OSO-services
* Added a mocked connected user
* Added a navigation menu
* Added an Overview page
* Added a Panel Maintenance page
* Added a Review page
* Various improvements for to the CI/CD pipeline
* Changed Sensitivity Calculator backend to V11.2.2
* Changed Band 5a to pass mid_band_5a
* Changed Band 5b to pass mid_band_5b
* Added new OSD endpoint to retrieve observatory data
* Changed existing constants to use osd data where available

2.0.0

-------

* [BREAKING] Changed backend from PHT Services to OSO Services 1.1.0
* Changed ODA version from 6.3.1 to 8.0.2
* [BREAKING] Changed Sensitivity Calculator backend to V11.2.0

1.0.4

-------

   * Fixed
      * Landing page
         - Removed extra 'the' from the sentence


1.0.3

-------

   * Changed
      * Title page
         - Option for LTP removed when KSP selected
      * General page
         - Cycle was not being displayed when the proposal is first created
      * Utilities
         - document URL changed to make use of the version of the application

1.0.2

-------

   * Reworked as previous patch failed to deploy
   
1.0.1

-------

   * Added: 

      * All Pages
         - Responsiveness
      * Target page
         - Validation on name field in Add target, remove ability to add duplicate targets 

   * Changed:

      * Observation page
         - Default value for 'num of stations' for a low observation, array = AA4, set to 512
         - All MID Bands, subarray AA2, Observation type Zoom is disabled


1.0.0

-------

   * Added: 
   
      * Observation page
         - Added Continuum and Zoom Bandwidth validation for Mid and Low
   
      * Utilities
         - Validation also checks and reports the status of each page.
  
   * Updated:
   
      * API mappings:
         - Updated PHT services version 2.4.0 to use ODA 6.2.1 to use PDM 16.0.1
         - Updated mailtoappings accordingly for PDM changes
      * Landing page
         - Time added to last update column
      * Team Page
         - Used SKAO email service so members can receive email through the tool. 
      * General Page
         - Changed order of Science Category and Abstract fields
      * Observation Page
         - Updated ``continuumIntegrationTime`` , ``continuumSynthBeamSize``, ``spectralIntegrationTime``, ``spectralSynthBeamSize`` to use the quantity with value and unit pair from the PDM.
      * Utilities
         - Change the notifications so that the icons stay to the left of any text
         - Changed the Error status to show an exclamation mark as opposed to a cross.
      * User Guide
         - Updated all the pages of the user guide based on feedback from SciOps

   * Fixed:
  
      * Target page
         - Fixed issue where navigation thru the target entry would cause the entire page to re-render
      * Observation
         - Fixed Sensitivity Calculator results for Mid AA05 observations


0.5.1

---

* Observation page
  - Fixed Sensitivity Calculator results for LOW AA05 observations
* Banner
  - Removed validation disabled check

0.5.0

---

* Utilities
  - Close icon added to Warning/Error notifications, timer removed
  - Close icon added to Success/Info notifications, timer still in place  
  - Validation failure changed to a modal containing list of all errors
  - Added presentation utility for the error results returned by the SensCalc API
* Validation button
  - Now disabled until all pages have an OK status
  - When disabled, the tooltip indicates the reasoning why the button is disabled
* Target Page
  - Increased padding around contents
* Observation page
  - Updated observation button set to primary color if there are no observations on the proposal
  - Updated so that previously saved values are not reset to default values upon editing the Observation set
  - Ability to override the initial ID provided to a new Observation Set
* Observation Entry
  - Updated the Group Observation field into it's own component
  - Removed the need for the Add Group Button by hooking it directly to the dropdown values
  - User is able to add their own group name
  - centralFrequency is no longer reset to a default value when the observing band or subarray are altered

---

0.4.2 

---

* Team Page:
   - Removed mailto implementation on the Team Member invitation button and replaced with functionality utilizing /send-email endpoint 
* Types:
   - Added new model EmailInviteBackend to support new endpoint /send-email 
* Sensitivity Calculations
   - Updated mappings
   - Updated display variations
   - Send a 2dn get Calculate request for supplied sensitivity case
   - Use get Weighting results to send thermal sensitivity for integration time calculations
   - Update mock requests
   - Update responses types
   - Correct robustness issue sent in request
* Observation page:
 - Fix effective resolution not updating on Spectral Averaging changes
 - Fix Spectral Resolution not updating on bandwidth changes for Zoom modes
* Testing
   - Renamed all component test files to conform to new standards
   - Added standard functions to help simplify testing process
* Responsiveness
   - Pages are now starting to be enhanced so that tablets can correctly display the application
* Codebase
   - Consolidation of folder structure
   - Code being reviewed and split to better conform to DRY

---

0.4.1 

---

* API mappings:
   - Updated PHT services version 2.2.0 to use refactored validate endpoint
* Target Page:
   - Disabled galactic coordinate 
* Observation page:
   - Updated sensitivity calculator results modal and results
* Testing: 
   - Added BDD tests
   
0.4.0

---

* API mappings:
   - Updated models to follow changes in the PHT services version 2.1.0
      - Removed metadata section for PUT and POST mapping as handled by ODA
      - Mapping to/from API for the SDP Data Products
      - Updated getProposalList mapping to new backend proposal format
      - Move front-end to backend mapping into putProposal and postProposal
      - Update postProposal mapping
      - PutProposal mapping
      - GetProposal mapping
      - Update proposal frontend types
   - Move putProposal mapping into a separate service to be used for save and validation
   - Update proposal Backend types and Mocks
   - Upgrade to version 5.2.0 of SKA-DB-ODA
   - Update pages accordingly for breaking changes
* Migrations:
   - Added the active proposal ID into the bottom-right of the footer for reference 
   - Migrated Image Weighting labels to the PHT.json file
   - Migrated Proposal Type labels and descriptions to the PHT.json file
   - Migrated Proposal Attribute labels and descriptions to the PHT.json file
   - Migrate page validations into separate utility 
* Duplicates:
   - BUG: Display only most recent proposal for duplicates in ProposalList
* Sensitivity Calculation results: 
   - Correct Sensitivity Calculator Results for Confusion Noise, Total Sensitivity, 
   - Weighted Sensitivity, Beam Size, LOW SBS and MID SBS Zoom
   - Fix observing band not being retrieved in mapping after update
   - Update SensCalc display results to display sensitivity or integration time
   - Added units to data in Observation SensCalc results modal
   - Removed units from SensCalc multiple display modal
   - Extended width of SensCalc Multiple display modal
   - Change some parameter names sent to Get Calculate endpoints to match new names used by endpoint
   - Use non rounded value for Low Zoom bandwidth in mapping for Sensitivity Calculator endpoints
* Science And Technical Page
   - Added Delete PDF button
   - Fix download pdf filename
* Data Product pages:
   - Added 'under development notes to the Add Data Product & SRC Net pages"
   - Updated SDP Page to only accept observations with passing SensCalc results
   - Updated structure of the DataProduct to cater for value/unit pairs
* Team Page:
   - Added mailto to the Team Member invitation button
* Observation page:
   - Ability to Edit an Observation
   - Upgraded Observation page so it can support multiple target/observation combinations
   - Edit proposal forces all linked target/observations to be re-calculated
   - Updated the default proposal for use with Add Proposal
   - Updated spectral resolution and effective resolution according to bandwidth, array selection and tapering values for Zoom modes
   - Fixed continuum bandwidth 300 MHz with AA4 subarray shows Value outside allowed range warning when it should be correct
   - Make use of default continuum bandwidths for each array for Low
   - Tapering field should not be available on Low.
   - Weather field should not be available for Low, only Mid
   - Supplied Sensitivity should not be available for Low, only Mid
   - Supplied Units for Low should only be H
   - Updated default Integration Time value for Low to 1
   - Updated SensCalc mapping & display ( Zoom & Continuum )
   - Image Size forced to be +ve
   - Migrated Image Weighting to a separate component with testing coverage of 100%
   - Updated the Observation selection to remove duplicates and update fields correctly when selected
   - Corrected SensCalc loading issue  
   - Updated display of the SensCalc for Observations
   - Observation updates in regards to MID Telescope
   - Addition of robust to the mappings
* Target Page:
   - Added the ability to Edit a target
   - Update target list on target page to show Redshift & Velocity
* Screen Auto-resizing:
   - Started to check screen resizing ( landing page and page banner so far ).
   - Standard height of the InfoCard
* Testing:  
   - Add e2e Testing into the CI/CD Pipeline
   - added user journeys
* Validation:  
   - Implement validation from of proposal with validate endpoint

0.3.1

---

* Changelog implemented
* Release version docs available

0.3.0

---

* Landing page:
   - Refined the action icons
   - Added proposal category to table

* Title Page:
   - Proposal sub-types is now optionally and users can choose multiple sub-types,
   - Users can use latex syntax and preview.

* Science and Technical justification pages:
   - Users can upload and download pdf

* Target page:
   - Users can select between galactic and equatorial coordinates systems and this now affects the table and target input
   - Resolve button now updates the velocity and redshift

* Observation page:
   - Observation set is now linked to the sensitivity calculator when linked to target(s)
   - Users can add observation sets to group
   - Syntax validation added to more fields

* SDP data page:
   - User can add data products for a given observation set
   - SDP data page now linked with observation page to pre-populate observation sets

* User Guide:
   - Updates based on changes
   - Field guided help ongoing

* SRC Net page:
   - Automatically valid as nothing is there
