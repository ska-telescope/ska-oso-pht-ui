/* eslint-disable no-restricted-syntax */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import theme from '../../../services/theme/theme';
import TeamContent from './TeamContent';
import { TEAM, TEAM_STATUS_TYPE_OPTIONS } from '../../../utils/constants';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<TeamContent />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <ThemeProvider theme={theme(theTheme)}>
          <CssBaseline />
          <TeamContent page={0} setStatus={cy.stub().as('setTheProposalState')} />
        </ThemeProvider>
      );
    });
  }
});

describe('Content', () => {
  beforeEach(() => {
    cy.mount(
      <ThemeProvider theme={theme(THEME_LIGHT)}>
        <CssBaseline />
        <TeamContent page={0} setStatus={cy.stub().as('setTheProposalState')} />
      </ThemeProvider>
    );
  });

  describe('Stars', () => {
    it('Displays filled star for PI', () => {
      const index = TEAM.findIndex(teamMember => teamMember.PI);
      if (index !== -1) {
        cy.get(`[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"] [data-testid="StarRateRoundedIcon"]`).should('exist');
      }
    });
    it('Displays border star for non PI accepted invitation', () => {
      const index = TEAM.findIndex(teamMember => !teamMember.PI && teamMember.Status === TEAM_STATUS_TYPE_OPTIONS.accepted);
      if (index !== -1) {
        cy.get(`[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"] [data-testid="StarBorderRoundedIcon"]`).should('exist');
      }
    });
    it('Displays no star for pending invitation', () => {
      const index = TEAM.findIndex(teamMember => teamMember.Status === TEAM_STATUS_TYPE_OPTIONS.pending);
      if (index !== -1) {
        cy.get(`[data-testid="teamTableId"] div[data-rowindex="${index}"] div[data-field="PI"]`).should('be.empty');
      }
    });
  });
});
