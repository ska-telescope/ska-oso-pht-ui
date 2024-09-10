Changelog
~~~~~~~~~

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

Future

---

0.4.1 

---

* API mappings:
   - Updated PHT services version 2.2.0 to use refactored validate endpoint
* Target Page:
   - Disabled galactic coordinate 
* Observation page:
   - Updated senscal results modal and results
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
   - Use non rounded value for Low Zoom bandwith in mapping for Sensitivity Calculator endpoints
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
