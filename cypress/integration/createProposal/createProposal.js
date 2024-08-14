import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import {
  clickAddProposal,
  clickCreateProposal, clickHome, clickSaveProposal,
  clickStandardProposalSubTypeTargetOfOpportunity, enterProposalTitle, verifyOnLandingPage, verifyProposalOnLandingPage
} from '../common/common';

Given('I am a PHT user who wants to create a proposal', () => {
  clickAddProposal()
});

When('I provide a title and select the proposal category', () => {
  enterProposalTitle()
  clickStandardProposalSubTypeTargetOfOpportunity()
  clickCreateProposal()
});

Then('a proposal with unique ID is created and I can see that on the landing page', () => {
  clickSaveProposal()
  clickHome()
  verifyOnLandingPage()
  verifyProposalOnLandingPage()
});