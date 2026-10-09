import { calibrationPage } from './pages/calibrationPage';
import { dataProductPage } from './pages/dataProductPage';
import { descriptionPage } from './pages/descriptionPage';
import { detailsPage } from './pages/detailsPage';
import { observationPage } from './pages/observationPage';
import { targetPage } from './pages/targetPage';
import { teamPage } from './pages/teamPage';
import { titlePage } from './pages/titlePage';

// What differs between cycles: how the cycle is picked when creating a proposal, the message
// shown once it has been created, where the editor lands, and the pages a journey goes through.
export const SV_CYCLE = {
  option: /Science Verification/,
  createdMessage: /Science Verification Idea added with unique identifier/,
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
