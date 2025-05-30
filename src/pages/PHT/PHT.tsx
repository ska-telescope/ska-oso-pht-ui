import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NAV, PATH } from '../../utils/constants';
import AddDataProduct from '../add/AddDataProduct/AddDataProduct';
import AddProposal from '../add/AddProposal/AddProposal';
import SdpDataPage from '../SdpDataPage/SdpDataPage';
import SrcDataPage from '../SrcDataPage/SrcDataPage';
import GeneralPage from '../GeneralPage/GeneralPage';
import ObservationEntry from '../entry/ObservationEntry/ObservationEntry';
import ObservationPage from '../ObservationPage/ObservationPage';
import SciencePage from '../SciencePage/SciencePage';
import TargetPage from '../TargetPage/TargetPage';
import TeamPage from '../TeamPage/TeamPage';
import TechnicalPage from '../TechnicalPage/TechnicalPage';
import TitlePage from '../TitlePage/TitlePage';
import LandingPage from '../LandingPage/LandingPage';

const ROUTES = [
  { path: PATH[0], element: <LandingPage /> },
  { path: NAV[0], element: <TitlePage /> },
  { path: NAV[1], element: <TeamPage /> },
  { path: NAV[2], element: <GeneralPage /> },
  { path: NAV[3], element: <SciencePage /> },
  { path: NAV[4], element: <TargetPage /> },
  { path: NAV[5], element: <ObservationPage /> },
  { path: NAV[6], element: <TechnicalPage /> },
  { path: NAV[7], element: <SdpDataPage /> },
  { path: NAV[8], element: <SrcDataPage /> },
  { path: PATH[1], element: <AddProposal /> },
  { path: PATH[2], element: <ObservationEntry /> },
  { path: PATH[3], element: <AddDataProduct /> }
];

declare const window: any;

export default function PHT() {
  return (
    <Router basename={window.env.REACT_APP_SKA_PHT_BASE_URL || '/'}>
      <Routes>
        {ROUTES.map((ROUTE, index) => {
          return <Route key={index} path={ROUTE.path} element={ROUTE.element} />;
        })}
      </Routes>
    </Router>
  );
}
