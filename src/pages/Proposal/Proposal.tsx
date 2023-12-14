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

  // TODO - We can call the getProposal from here

  return (
    <>
      <PageBanner title={PAGES[thePage].title.toUpperCase()} addPage={1} setPage={setThePage} />
      {thePage === 0 && <TitleContent />}
      {thePage === 1 && <TeamContent />}
      {thePage === 2 && <GeneralContent />}
      {thePage === 3 && <ScienceContent />}
      {thePage === 4 && <TargetContent />}
      {thePage === 5 && <ObservationContent />}
      {thePage === 6 && <TechnicalContent />}
      {thePage === 7 && <DataContent />}
      <PageFooter pageNo={thePage} buttonFunc={setThePage} />
    </>
  );
}
