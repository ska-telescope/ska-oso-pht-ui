import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Box } from '@mui/material';
import { EMPTY_STATUS, PAGE_TITLE_ADD } from '@utils/constants.ts';
import Shell from '../../../components/layout/Shell/Shell';
import TitleEntry from '../../entry/TitleEntry/TitleEntry';
import Proposal, { NEW_PROPOSAL } from '../../../utils/types/proposal';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

const PAGE = PAGE_TITLE_ADD;
const PAGE_INNER = 0;
const PAGE_FOOTER = -1;

export default function AddProposal() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const { isSV } = useAppFlow();
  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    updateAppContent1(EMPTY_STATUS);
    let temp = NEW_PROPOSAL;
    // TODO : temp.cycle = fetchCycleData().id;
    updateAppContent2(temp);
  }, []);

  const titleValid = () => getProposal()?.title?.length > 0;
  const typeValid = () => (isSV() ? true : getProposal()?.proposalType > 0);
  const contentValid = () => titleValid() && typeValid();

  return (
    <Box pt={2}>
      <Shell page={PAGE} footerPage={PAGE_FOOTER} buttonDisabled={!contentValid()}>
        <TitleEntry page={PAGE_INNER} />
      </Shell>
    </Box>
  );
}
