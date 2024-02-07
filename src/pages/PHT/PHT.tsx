import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import { NAV } from '../../utils/constants';
//import AddObservation from '../AddObservation/AddObservation';
//import AddProposal from '../AddProposal/AddProposal';
//import DataPage from '../DataPage/DataPage';
//import GeneralPage from '../GeneralPage/GeneralPage';
import LandingPage from '../LandingPage/LandingPage';
//import ObservationPage from '../ObservationPage/ObservationPage';
//import SciencePage from '../SciencePage/SciencePage';
//import TargetPage from '../TargetPage/TargetPage';
//import TeamPage from '../TeamPage/TeamPage';
//import TechnicalPage from '../TechnicalPage/TechnicalPage';
//import TitlePage from '../TitlePage/TitlePage';

export default function PHT() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/*<Route path={NAV[0]} element={<TitlePage />} />
        <Route path={NAV[1]} element={<TeamPage />} />
        <Route path={NAV[2]} element={<GeneralPage />} />
        <Route path={NAV[3]} element={<SciencePage />} />
        <Route path={NAV[4]} element={<TargetPage />} />
        <Route path={NAV[5]} element={<ObservationPage />} />
        <Route path={NAV[6]} element={<TechnicalPage />} />
        <Route path={NAV[7]} element={<DataPage />} />
        <Route path="/addProposal" element={<AddProposal />} />
  <Route path="/addObservation" element={<AddObservation />} />*/}
      </Routes>
    </Router>
  );
}
