describe('GIVEN that I am a user on the main page of the PHT', () => {
  context('WHEN I wish to create a standard Proposal', () => {
    beforeEach(() => {
      cy.viewport(2000, 1000);
      cy.visit('/');
      cy.get('[data-testid="skaoLogo"]', { timeout: 30000 });

      cy.intercept(
        {
          method: 'POST' // Route all GET requests
          // url: '/users/*', // that have a URL that matches '/users/*'
        },
        [] // and force the response to be: []
      ).as('getUsers'); // and assign an alias
    });

    /*** Validate the page ****/

    const homePageConfirmed = () => {
      cy.get('[data-testid="addProposalButton"]').should('exist');
    };

    const pageConfirmed = label => {
      cy.get('#pageTitle').contains(label);
    };

    const verifyProposalDisplayPage = () => {};

    /**** Button clicks ****/

    const clickHomeButton = () => {
      cy.get('[data-testid="homeButtonTestId"]')
        .should('exist')
        .click();
      homePageConfirmed();
    };

    const clickAddObservation = () => {
      cy.get('[data-testid="addObservationButton"]').click();
      pageConfirmed('OBSERVATION');
    };

    const clickAddProposal = () => {
      cy.get('[data-testid="addProposalButton"]').click();
      pageConfirmed('TITLE');
    };

    const clickCreateProposal = () => {
      cy.get('[data-testid="CreateButton"]').click();
      cy.get('[data-testid="timeAlertFooter"]').should('exist');
      pageConfirmed('TEAM');
    };

    const clickObservationSetup = () => {
      cy.get('[data-testid="addObservationButton"]').click();
      pageConfirmed('OBSERVATION SETUP');
    };

    const clickPageForward = () => {
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
    };

    const clickValidateButton = () => {
      cy.get('[data-testid="ValidationTestId"]').click();
    };

    const submitButtonClick = () => {
      // TODO : Need to remove the forcing so that testing for disabled is implied.
      cy.get('[data-testid="SubmitTestId"]').click({ force: true });
    };

    const submitButtonDisabled = () => {
      cy.get('[data-testid="SubmitTestId"]').should('be.disabled');
    };

    const clickSubmitConfirmationButton = () => {
      // TODO : Disabled until submitButtonClick TODO is resolved.
      // cy.get('[data-testid="displayConfirmationButton"]').click();
    };

    /**** Page entry ****/

    const addObservationEntry = () => {
      cy.get('[data-testid="observingBand"]').contains('Low Band (50 - 350 MHz)');
      cy.get('[data-testid="subArrayConfiguration"]').contains('AA4');
      //
      // TODO : Add more content
      cy.get('[id="observationType"]').contains('Continuum');
      cy.get('[data-testid="suppliedType"]').contains('Integration Time');
      cy.get('[data-testid="suppliedUnits"]').contains('s');
      cy.get('#spectralResolution')
        .should('have.value', '5.43 kHz (8.1 km/s)')
        .should('be.disabled');
      cy.get('#spectralAveraging').should('have.value', '1');
      cy.get('[id="imageWeighting"]').contains('Uniform');
    };

    const titlePageEntry = () => {
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
    };

    const teamPageEntry = () => {
      cy.get('[data-testid="firstName"]').type('User');
      cy.get('[data-testid="lastName"]').type('Name');
      cy.get('[data-testid="email"]').type('username@test.com');
      cy.get('[data-testid="Send invitationButton"]').click({ force: true });

      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'User')
        .should('contain', 'Name')
        .should('contain', 'Pending')
        .should('contain', 'Van')
        .should('contain', 'Cheng')
        .should('contain', 'Accepted')
        .should('have.length', 2);
    };

    const generalPageEntry = () => {
      cy.get('[data-testid="abstractId"]').type('Test Abstract');
      cy.get('[id="categoryId"]').click({ force: true });
      cy.get('[data-value="1"]').click({ force: true });
      cy.get('[id="categoryId"]').should('contain', 'Cosmology');
    };

    const sciencePageEntry = () => {
      // TODO
    };

    const targetPageEntryManual = () => {
      cy.get('[id="name"]').type('M1');
      cy.get('[id="skyDirectionValue1"]').type('0:0:0');
      cy.get('[id="skyDirectionValue2"]').type('0:0:0');
      cy.get('[data-testid="velocityValue"]').type('1');
      cy.get('[data-testid="addTargetButton"]').click({ force: true });

      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'M1')
        .should('contain', '0:0:0')
        .should('contain', '0:0:0')
        .should('have.length', 1);
    };

    const targetPageEntryFile = () => {
      cy.get('input[type="file"]').as('fileInput');

      cy.fixture('target_equatorial_valid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_equatorial_valid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();

      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'equatorial1')
        .should('contain', '05:34:30.900')
        .should('contain', '+22:00:53.000')
        .should('have.length', 8);
    };

    const observationPageTargets = () => {
      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'AA4')
        .should('contain', 'Continuum')
        .should('contain', 'M1')
        .should('have.length', 9);

      /*
      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
      .children('div[role="row"]')
      .should('contain', 'equatorial1')
      .should('contain', '05:34:30.900')
      .should('contain', '+22:00:53.000')
      .should('have.length', 8);
      */
    };

    const technicalPageEntry = () => {
      // TODO
    };

    const SDPPageEntry = () => {
      // TODO
    };

    const SRCPageEntry = () => {
      // Page is empty so nothing to do here.
    };

    /**** TESTS ****/

    it('THEN I can enter the details AND confirm the proposal has been added', () => {
      homePageConfirmed();
      clickAddProposal();
      titlePageEntry();
      clickCreateProposal();
      teamPageEntry();
      clickPageForward();
      pageConfirmed('GENERAL');
      generalPageEntry();
      clickPageForward();
      pageConfirmed('SCIENCE');
      sciencePageEntry();
      clickPageForward();
      pageConfirmed('TARGET');
      targetPageEntryManual();
      cy.get('[id="simple-tab-1"]').click();
      targetPageEntryFile();
      clickPageForward();
      pageConfirmed('OBSERVATION');
      clickObservationSetup();
      addObservationEntry();
      clickAddObservation();
      observationPageTargets();
      clickPageForward();
      pageConfirmed('TECHNICAL');
      technicalPageEntry();
      clickPageForward();
      pageConfirmed('SDP DATA');
      SDPPageEntry();
      clickPageForward();
      pageConfirmed('SRC NET');
      SRCPageEntry();
      submitButtonDisabled();
      clickValidateButton();
      submitButtonClick();
      verifyProposalDisplayPage();
      // clickSubmitConfirmationButton();
      // homePageConfirmed();
    });

    it('AND I cam begin to create a proposal, then in Target page to add equatorial target with csv with valid csv', () => {
      cy.get('[data-testid="addProposalButton"]').click();
      //Complete title page
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
      cy.get('[data-testid="CreateButton"]').click();

      // Go to target page
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();

      //import target from file
      cy.get('[id="simple-tab-1"]').click();
      cy.get('input[type="file"]').as('fileInput');

      cy.fixture('target_equatorial_valid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_equatorial_valid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();
      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'equatorial1')
        .should('contain', '05:34:30.900')
        .should('contain', '+22:00:53.000')
        .should('have.length', 7);
    });

    it('AND I cam begin to create a proposal, then in Target page to add equatorial target with csv with invalid csv (correct schema with partial empty rows)', () => {
      cy.get('[data-testid="addProposalButton"]').click();
      //Complete title page
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
      cy.get('[data-testid="CreateButton"]').click();

      // Go to target page
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();

      //import target from file
      cy.get('[id="simple-tab-1"]').click();
      cy.get('input[type="file"]').as('fileInput');

      cy.fixture('target_equatorial_invalid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_equatorial_invalid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();
      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'equatorial4')
        .should('contain', '05:34:30.900')
        .should('contain', '+22:00:53.000')
        .should('have.length', 4);
    });

    it('AND I cam begin to create a proposal, then in Target page to add equatorial target with csv with invalid csv (incorrect schema)', () => {
      cy.get('[data-testid="addProposalButton"]').click();
      //Complete title page
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
      cy.get('[data-testid="CreateButton"]').click();

      // Go to target page
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();

      //import target from file
      cy.get('[id="simple-tab-1"]').click();
      cy.get('input[type="file"]').as('fileInput');

      cy.fixture('target_galactic_valid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_galactic_valid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();
      cy.get(
        'div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
      ).should('not.exist');
    });

    it('AND I cam begin to create a proposal, then in Target page to add galactic target with valid csv', () => {
      cy.get('[data-testid="addProposalButton"]').click();
      //Complete title page
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
      cy.get('[data-testid="CreateButton"]').click();

      // Go to target page
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();

      //import target from file
      cy.get('[id="simple-tab-1"]').click();
      cy.get('input[type="file"]').as('fileInput');

      cy.get('[data-testid="referenceCoordinatesType"]').click();
      cy.get('[data-value="1"]').click();

      cy.fixture('target_galactic_valid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_galactic_valid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();
      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'galactic1')
        // TODO: enable checking after fixing galatic lat lon not displayed properly
        // .should('contain', '+11:55:00.00')
        // .should('contain', '+33:55:00.00')
        .should('have.length', 7);
    });

    it('AND I cam begin to create a proposal, then in Target page to add galactic target with csv with invalid csv (correct schema with partial empty rows)', () => {
      cy.get('[data-testid="addProposalButton"]').click();
      //Complete title page
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
      cy.get('[data-testid="CreateButton"]').click();

      // Go to target page
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();

      // import target from file
      cy.get('[id="simple-tab-1"]').click();
      cy.get('input[type="file"]').as('fileInput');

      // Choose galactic
      cy.get('[data-testid="referenceCoordinatesType"]').click();
      cy.get('[data-value="1"]').click();

      cy.fixture('target_galactic_invalid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_galactic_invalid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();
      cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
        .children('div[role="row"]')
        .should('contain', 'galactic4')
        // TODO: enable checking after fixing galatic lat lon not displayed properly
        // .should('contain', '+44:55:00.00')
        // .should('contain', '+33:55:00.00')
        .should('have.length', 4);
    });

    it('AND I cam begin to create a proposal, then in Target page to add galactic target with csv with invalid csv (incorrect schema)', () => {
      cy.get('[data-testid="addProposalButton"]').click();
      //Complete title page
      cy.get('[data-testid="titleId"]').type('Test Proposal');
      cy.get('[id="ProposalType-1"]').click({ force: true });
      cy.get('[aria-label="A target of opportunity observing proposal"]').click();
      cy.get('[data-testid="CreateButton"]').click();

      // Go to target page
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();
      cy.get('[data-testid="ArrowForwardIosIcon"]').click();

      // Choose galactic
      cy.get('[data-testid="referenceCoordinatesType"]').click();
      cy.get('[data-value="1"]').click();

      //import target from file
      cy.get('[id="simple-tab-1"]').click();
      cy.get('input[type="file"]').as('fileInput');

      cy.fixture('target_equatorial_valid.csv').then(fileContent => {
        cy.get('@fileInput').attachFile({
          fileContent: fileContent.toString(),
          fileName: 'target_equatorial_valid.csv',
          mimeType: 'text/csv'
        });
      });
      cy.get('[data-testid="csvUploadUploadButton"]').click();
      cy.get(
        'div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]'
      ).should('not.exist');
    });

    // it('Content : Update existing proposal, add and delete target', () => {
    //   //filter by draft status
    //   cy.get('[data-testid="proposalType"]').click();
    //   cy.get('[data-value="draft"]').click();
    //   //open draft proposal
    //   // cy.get('[data-testid="EditRoundedIcon"]').click();
    //   //navigate to target page
    //   cy.get('[testid="pageTitle-4"]').click();
    //   //add target
    //   cy.get('[id="name"]').type('M1');
    //   cy.get('[id="skyDirectionValue1"]').type('0:0:0');
    //   cy.get('[id="skyDirectionValue2"]').type('0:0:0');
    //   //default is type velocity
    //   cy.get('[name="textField"]').type('1');
    //   cy.get('[data-testid="Add targetButton"]').click({ force: true });
    //   //delete target - TODO: Refactor below selector once test data is available
    //   cy.get(
    //     `#root > div.MuiGrid-root.MuiGrid-container.MuiGrid-direction-xs-column.css-jmdt0k-MuiGrid-root > div.MuiGrid-root.MuiGrid-container.MuiGrid-direction-xs-column.css-372aq-MuiGrid-root > div.MuiGrid-root.MuiGrid-item.css-1mum6ye-MuiGrid-root > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-11.MuiGrid-grid-md-5.css-116ybk4-MuiGrid-root > div > div > div.MuiDataGrid-main.css-204u17-MuiDataGrid-main > div.MuiDataGrid-virtualScroller.css-qvtrhg-MuiDataGrid-virtualScroller > div > div > div.super-app-theme.MuiDataGrid-row.MuiDataGrid-row--lastVisible > div.MuiDataGrid-cell--withRenderer.MuiDataGrid-cell.MuiDataGrid-cell--textLeft.MuiDataGrid-withBorderColor > span > button > svg > path`
    //   )
    //     .should('exist')
    //     .click();
    //   //confirm deletion
    //   cy.get('[data-testid="ConfirmButton"]').click();
    // });

    // it('Content : Update existing proposal, add and delete team member ', () => {
    //   //filter by draft status
    //   cy.get('[data-testid="proposalType"]').click();
    //   cy.get('[data-value="draft"]').click();
    //   //open draft proposal
    //   cy.get('[data-testid="EditRoundedIcon"]').click();
    //   //navigate to team page
    //   cy.get('[testid="pageTitle-1"]').click();
    //   //add team member as PI and select PhD thesis
    //   cy.get('[data-testid="firstName"]').type('User');
    //   cy.get('[data-testid="lastName"]').type('Name');
    //   cy.get('[data-testid="email"]').type('username@test.com');
    //   cy.get('[testid="piCheckbox"]').click();
    //   cy.get('[testid="PhDCheckbox"]').click();
    //   cy.get('[data-testid="Send invitationButton"]').click({ force: true });
    //   cy.get('div[role="presentation"].MuiDataGrid-virtualScrollerContent > div[role="rowgroup"]')
    //     .children('div[role="row"]')
    //     .should('contain', 'User')
    //     .should('contain', 'Name')
    //     .should('contain', 'Pending')
    //     .should('contain', 'No')
    //     .should('have.length', 2);
    //   //delete team member - TODO: Refactor below selector once test data is available
    //   cy.get(
    //     `#root > div.MuiGrid-root.MuiGrid-container.MuiGrid-direction-xs-column.css-11q92mh-MuiGrid-root > div > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-11.MuiGrid-grid-md-5.css-116ybk4-MuiGrid-root > div > div > div.MuiDataGrid-main.css-204u17-MuiDataGrid-main > div.MuiDataGrid-virtualScroller.css-qvtrhg-MuiDataGrid-virtualScroller > div > div > div.super-app-theme.MuiDataGrid-row.MuiDataGrid-row--lastVisible > div:nth-child(6) > span > button`
    //   )
    //     .should('exist')
    //     .click();
    //   //confirm deletion
    //   cy.get('[data-testid="ConfirmButton"]').click();
    // });
  });
});
