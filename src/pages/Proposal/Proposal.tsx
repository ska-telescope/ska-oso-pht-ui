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
import GetProposal from '../../services/axios/getProposal/getProposal';

export default function Proposal() {
  const [thePage, setThePage] = React.useState(0);
  const [proposalState, setProposalState] = React.useState([5, 5, 5, 5, 5, 5, 5, 5]);
  const [proposal, setProposal] = React.useState(null);
  const [original, setOriginal] = React.useState(null);

  React.useEffect(() => {
    if (!proposal) {
      const result = GetProposal();
      setOriginal(result);
      setProposal(result);
    }
  }, [proposal]);

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
      {thePage === 0 && <TitleContent page={thePage} original={original} theProposal={proposal} setProposal={setProposal} setStatus={setTheProposalState} />}
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
