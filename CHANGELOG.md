# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

Future

---

* Observation page: 
   - Updated spectral resolution and effective resolution according to bandwidth, array selection and tapering values for Zoom modes
* STAR-469 : Upgraded Observation page so it can support multiple target/observation combinations
* STAR-537 : Added the ability to Edit a target
* STAR-547 : Migrate page validations into separate utility 
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
