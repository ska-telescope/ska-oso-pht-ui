import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';

import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';

import DataContent from './DataContent/DataContent';
import GeneralContent from './GeneralContent/GeneralContent';
import ObservationContent from './ObservationContent/ObservationContent';
import ScienceContent from './ScienceContent/ScienceContent';
import TargetContent from './TargetContent/TargetContent';
import TeamContent from './TeamContent/TeamContent';
import TechnicalContent from './TechnicalContent/TechnicalContent';
import TitleContent from './TitleContent/TitleContent';

import { DEFAULT_HELP, PAGES } from '../../utils/constants';
import MockProposal from '../../services/axios/getProposal/mockProposal';

export default function Proposal() {
  const {
    application,
    clearApp,
    helpComponent,
    updateAppContent1,
    updateAppContent2,
    updateAppContent3
  } = storageObject.useStore();
  const [thePage, setThePage] = React.useState(0);

  React.useEffect(() => {
    helpComponent(DEFAULT_HELP);
    clearApp();
    updateAppContent1([5, 5, 5, 5, 5, 5, 5, 5]);
    updateAppContent2(MockProposal); // TODO Replace with axios/GetProposal();
    updateAppContent3(MockProposal); // TODO Replace with axios/GetProposal();
  }, []);

  const getProposalState = () => application.content1 as number[];

  const setTheProposalState = (e: number[]) => {
    const [page, value] = e;
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(page === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  return (
    <>
      <PageBanner title={PAGES[thePage].toUpperCase()} addPage={1} setPage={setThePage} />
      {thePage === 0 && <TitleContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 1 && <TeamContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 2 && <GeneralContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 3 && <ScienceContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 4 && <TargetContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 5 && <ObservationContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 6 && <TechnicalContent page={thePage} setStatus={setTheProposalState} />}
      {thePage === 7 && <DataContent page={thePage} setStatus={setTheProposalState} />}
      <PageFooter pageNo={thePage} buttonFunc={setThePage} />
    </>
  );
}
