# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

Future

---

* STAR-644:
   - Updated display of the Title page
   - Migrated Image Weighting labels to the PHT.json file
   - Migrated Proposal Type labels and descriptions to the PHT.json file
   - Migrated Proposal Attribute labels and descriptions to the PHT.json file
* STAR-640:
   - Display only most recent proposal for duplicates in ProposalList
   - remove metadata section for PUT and POST mapping as handled by ODA
* STAR-635: 
   - Correct Sensitivity Calculator Results for Confusion Noise, Total Sensitivity, 
   Weighted Sensitivity, Beam Size, LOW SBS and MID SBS Zoom
* STAR-570:
   - Added Delete PDF button in Science and Technical Page
   - Upgrade to version 2.1.0 of ska-oso-pht-services
* STAR-625:
   - Mapping to/from API for the SDP Data Products
* STAR-636:
   - Added 'under development notes to the Add Data Product & SRC Net pages"
* STAR-588:
   - Added mailto to the Team Member invitation button
* STAR-627:
   - Fix download pdf filename for science and technical page
* STAR-296:
   - Created GridMember component for use in Team Page and Proposal Display
   - Updated Proposal Display to reflect latest requirements
   - Minor resource file updates
   - Added the active proposal ID into the bottom-right of the footer for reference 
   - Addition of 'emptyCell' component
   - Addition of some presentation function for various data types
   - Started to check screen resizing ( landing page and page banner so far ).
   - Standard height of the InfoCard
* STAR-624: 
   - Updated SensCalc mapping & display ( Zoom & Continuum )
   - Removed units from SensCalc multiple display modal
   - Extended width of SensCalc Multiple display modal
   - Updated SDP Page to only accept observations with passing SensCalc results
   - Image Size forced to be +ve
* STAR-536: 
   - Ability to Edit an Observation
   - Edit proposal forces all linked target/observations to be re-calculated
   - Updated the default proposal for use with Add Proposal
   - Added units to data in Observation SensCalc results modal
* STAR-609: 
   - Observation updates in regards to MID Telescope
   - Correction of most of the console.log warnings
   - Addition of robust to the mappings
   - Some code refactoring and tidy up
* STAR-615: Proposal mapping:
   - PutProposal mapping
   - Move putProposal mapping into a separate service to be used for save and validation
   - Update SensCalc display results to display sensitivity or integration time
   - Update pages accordingly for breaking changes
   - Update proposal frontend types
* STAR-606: Proposal mapping:
   - GetProposal mapping
   - Update proposal frontend types
   - Update pages accordingly for breaking changes
* STAR-508: Updated spectral resolution and effective resolution according to bandwidth, array selection and tapering values for Zoom modes
* STAR-540 : Proposal mapping:
   - Update getProposalList mapping to new backend proposal format
   - Move front-end to backend mapping into putProposal and postProposal
   - Update postProposal mapping
   - Update proposal Backend types and Mocks
* STAR-529: Implement validation from OSD with validate endpoint
   - Updated spectral resolution and effective resolution according to bandwidth, array selection and tapering values for Zoom modes
* STAR-469 : Upgraded Observation page so it can support multiple target/observation combinations
* STAR-537 : Added the ability to Edit a target
* STAR-547 : Migrate page validations into separate utility 
* STAR-573 : Add e2e Testing into the CI/CD Pipeline
* STAR-575 : Update target list on target page to show Redshift & Velocity
* STAR-587
   - Migrated Image Weighting to a separate component with testing coverage of 100%
   - Updated the Observation selection to remove duplicates and update fields correctly when selected
   - Corrected SensCalc loading issue
   - Updated structure of the DataProduct to cater for value/unit pairs
   - Updated screens to reflect new structure
   - Updated display of the SensCalc for Observations
* STAR-608 : Observation page updated for LOW / CONTINUUM
   - Continuum bandwidth 300 MHz with AA4 subarray shows Value outside allowed range warning when it should be correct
   - Tapering field should not be available on Low.
   - Weather field should not be available for Low, only Mid
* STAR-469 : Upgraded Observation page so it can support multiple target/observation combinations
* STAR-508: Updated spectral resolution and effective resolution according to bandwidth, array selection and tapering values for Zoom modes
* STAR-540 : Proposal mapping:
   - Update getProposalList mapping to new backend proposal format
   - Move front-end to backend mapping into putProposal and postProposal
   - Update postProposal mapping
   - Update proposal Backend types and Mocks
   - Upgrade to version 2.0.1 of SKA-PHT-SERVICES and 5.2.0 of SKA-DB-ODA
* STAR-529: Implement validation from OSD with validate endpoint

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
