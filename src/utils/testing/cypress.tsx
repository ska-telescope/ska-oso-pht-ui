import { THEME_DARK, THEME_LIGHT } from '@ska-telescope/ska-gui-components';

export const THEME = [THEME_DARK, THEME_LIGHT];

export const viewPort = (format = 'pc') => {
  const isPC = () => format === 'pc';
  const xAxis = isPC() ? 1500 : 600;
  const yAxis = isPC() ? 1500 : 600;
  cy.viewport(xAxis, yAxis);
};
