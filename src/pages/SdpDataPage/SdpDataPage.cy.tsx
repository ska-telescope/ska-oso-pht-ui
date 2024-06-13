import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { Router } from 'react-router-dom';
import theme from '../../services/theme/theme';
import SdpDataPage from './SdpDataPage';

const THEME = [THEME_DARK, THEME_LIGHT];

describe('<DataPage />', () => {
  for (const theTheme of THEME) {
    it(`Theme ${theTheme}: Renders`, () => {
      cy.mount(
        <StoreProvider>
          <ThemeProvider theme={theme(theTheme)}>
            <CssBaseline />
            <Router location="/" navigator={undefined}>
              <SdpDataPage />
            </Router>
          </ThemeProvider>
        </StoreProvider>
      );
    });
  }
});

//  THINGS TO BE TESTED
//
//  NO OBVERSATIONS
//       ADD BUTTON : DISABLED
//       ERROR PANEL : CONTAINING MESSAGE STATING THAT THERE ARE NO OBSERVATIONS
//       DATAGRID : NOT PRESSENT
//
//  NEED TO ADD AN OBVERSATION AT THIS POINT
//
//  OBVERSATIONS, NO DATA PRODUCTS
//       ADD BUTTON : ENABLED
//       ERROR PANEL : CONTAINING MESSAGE STATING THAT THERE ARE NO DATA PRODUCTS
//       DATAGRID : NOT PRESSENT
//
//  NEED TO ADD AN DATA PRODUCT AT THIS POINT
//
//  IF OBVERSATIONS, DATA PRODUCTS
//       ADD BUTTON : ENABLED
//       ERROR PANEL : NOT PRESENT
//       DATAGRID : PRESENT
//
//  TEST THE REMOVAL OF A DATA PRODUCT AT THIS POINT
