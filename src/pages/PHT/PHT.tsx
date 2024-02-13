import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NAV, PATH } from '../../utils/constants';
import AddObservation from '../AddObservation/AddObservation';
import AddProposal from '../AddProposal/AddProposal';
import DataPage from '../DataPage/DataPage';
import GeneralPage from '../GeneralPage/GeneralPage';
import ObservationPage from '../ObservationPage/ObservationPage';
import SciencePage from '../SciencePage/SciencePage';
import TargetPage from '../TargetPage/TargetPage';
import TeamPage from '../TeamPage/TeamPage';
import TechnicalPage from '../TechnicalPage/TechnicalPage';
import TitlePage from '../TitlePage/TitlePage';
import LandingPage from '../LandingPage/LandingPage';
import { env } from '../../env';

const ROUTES = [
  { path: PATH[0], element: <LandingPage /> },
  { path: NAV[0], element: <TitlePage /> },
  { path: NAV[1], element: <TeamPage /> },
  { path: NAV[2], element: <GeneralPage /> },
  { path: NAV[3], element: <SciencePage /> },
  { path: NAV[4], element: <TargetPage /> },
  { path: NAV[5], element: <ObservationPage /> },
  { path: NAV[6], element: <TechnicalPage /> },
  { path: NAV[7], element: <DataPage /> },
  { path: PATH[1], element: <AddProposal /> },
  { path: PATH[2], element: <AddObservation /> }
];

export default function PHT() {
  const getPath = (inValue: string) => {
    return env.REACT_APP_SKA_PHT_BASE_URL + inValue;
  };

  return (
    <Router>
      <Routes>
        {ROUTES.map((ROUTE, index) => {
          return <Route key={index} path={getPath(ROUTE.path)} element={ROUTE.element} />;
        })}
      </Routes>
    </Router>
  );
}
