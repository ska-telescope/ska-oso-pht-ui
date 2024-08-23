import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import {
  clickAddProposal,
  clickCreateProposal,
  clickHome,
  clickStandardProposalSubTypeTargetOfOpportunity,
  enterProposalTitle,
  verifyOnLandingPage,
  verifyFirstProposalOnLandingPageIsVisible,
  verifyOnLandingPageFilterIsVisible,
  verifyProposalCreatedAlertFooter
} from '../common/common';

Given('I am a PHT user who wants to create a proposal', () => {
  clickAddProposal();
});

When('I provide a title and select the proposal category', () => {
  enterProposalTitle();
  clickStandardProposalSubTypeTargetOfOpportunity();
  verifyProposalCreatedAlertFooter();
  clickCreateProposal();
});

Then('a proposal with unique ID is created and I can see that on the landing page', () => {
  clickHome();
  verifyOnLandingPage();
  verifyOnLandingPageFilterIsVisible();
  verifyFirstProposalOnLandingPageIsVisible();
});
