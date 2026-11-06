import { calibrationPage } from './pageObjects/calibrationPage';
import { dataProductPage } from './pageObjects/dataProductPage';
import { descriptionPage } from './pageObjects/descriptionPage';
import { detailsPage } from './pageObjects/detailsPage';
import { observationPage } from './pageObjects/observationPage';
import { targetPage } from './pageObjects/targetPage';
import { teamPage } from './pageObjects/teamPage';
import { titlePage } from './pageObjects/titlePage';
import type { Cycle } from './types';

export const SV_CYCLE: Cycle = {
  option: /Science Verification/,
  createdMessage: /Science Verification Idea added with unique identifier/,
  validMessage: 'Science Verification Idea is Valid',
  pageAfterCreate: teamPage,
  pageAfterOpen: titlePage,
  pages: [
    titlePage,
    teamPage,
    detailsPage,
    descriptionPage,
    targetPage,
    observationPage,
    dataProductPage,
    calibrationPage
  ]
};
