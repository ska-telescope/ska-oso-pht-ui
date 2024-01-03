import React from 'react';
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

import { PAGES } from '../../utils/constants';

export default function Proposal() {
  const [thePage, setThePage] = React.useState(0);
  const [proposalState, setProposalState] = React.useState([5, 5, 5, 5, 5, 5, 5, 5]);

  // TODO - We can call the getProposal from here

  const setTheProposalState = (e: number[]) => {
    const [page, value] = e;
    const temp = [];
    for (let i = 0; i < proposalState.length; i++) {
      temp.push(page === i ? value : proposalState[i]);
    }
    setProposalState(temp);
  };

  return (
    <>
      <PageBanner
        title={PAGES[thePage].toUpperCase()}
        addPage={1}
        setPage={setThePage}
        proposalState={proposalState}
      />
      {thePage === 0 && <TitleContent page={0} setStatus={setTheProposalState} />}
      {thePage === 1 && <TeamContent page={1} setStatus={setTheProposalState} />}
      {thePage === 2 && <GeneralContent page={2} setStatus={setTheProposalState} />}
      {thePage === 3 && <ScienceContent page={3} setStatus={setTheProposalState} />}
      {thePage === 4 && <TargetContent page={4} setStatus={setTheProposalState} />}
      {thePage === 5 && <ObservationContent page={5} setStatus={setTheProposalState} />}
      {thePage === 6 && <TechnicalContent page={6} setStatus={setTheProposalState} />}
      {thePage === 7 && <DataContent page={7} setStatus={setTheProposalState} />}
      <PageFooter pageNo={thePage} buttonFunc={setThePage} />
    </>
  );
}
