//**Solution was failing to access the application state from the storageObject.

// import {
//   addM2TargetUsingResolve,
//   clickAddProposal, clickCreateProposal,
//   clickCycleConfirm,
//   clickProposalTypePrincipleInvestigator,
//   clickSubProposalTypeTargetOfOpportunity, clickTargetPageFromBannerNav,
//   clickToAddTarget,
//   enterProposalTitle,
//   initialize,
//   mockCreateProposalAPI,
//   mockResolveTargetAPI, verifyProposalCreatedAlertFooter
// } from '../../common/common.js';
// import { standardUser } from '../../users/users.js';
//
// describe('Verify setProposal functionality', () => {
//   beforeEach(() => {
//     initialize(standardUser);
//     mockCreateProposalAPI();
//     mockResolveTargetAPI();
//     clickAddProposal();
//     clickCycleConfirm();
//     enterProposalTitle();
//     clickProposalTypePrincipleInvestigator();
//     clickSubProposalTypeTargetOfOpportunity();
//     clickCreateProposal();
//     cy.wait('@mockCreateProposal');
//     verifyProposalCreatedAlertFooter();
//     clickTargetPageFromBannerNav();    //navigate to target page
//
//     cy.intercept('GET', '**/pht/prsls/prsl-t0001-20251024-00001', {
//       body: {
//         targets: [
//           { id: 1, name: 'Target1', raStr: '00:00:00', decStr: '00:00:00' }
//         ]
//       }
//     }).as('getProposal');
//
//     cy.window().then((win) => {
//       // Mock the storageObject and its useStore method
//       win.storageObject = {
//         useStore: () => ({
//           application: {
//             content2: {
//               targets: [
//                 { id: 1, name: 'Target1', raStr: '00:00:00', decStr: '00:00:00' }
//               ]
//             }
//           },
//           updateAppContent2: cy.spy().as('updateAppContent2Spy') // Spy on the updateAppContent2 function
//         })
//       };
//     });
//   });
//
//   it('should update proposal with new target when Add Target button is clicked', () => {
//     addM2TargetUsingResolve();
//     cy.wait('@mockResolveTarget');
//     clickToAddTarget()
//
//     // Assert that the proposal is updated with the new target
//     cy.window().then((win) => {
//       expect(win.application?.content2?.targets).to.deep.include({
//         id: 1,
//         name: 'Target1',
//         raStr: '00:00:00',
//         decStr: '00:00:00'
//       });
//     });
//
//     cy.window().its('storageObject.useStore().application.content2.targets').should('exist');});
// });
