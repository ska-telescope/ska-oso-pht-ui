import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Shell from '../../../components/layout/Shell/Shell';
import TitleEntry from '../../entry/TitleEntry/TitleEntry';
import { EMPTY_STATUS } from '../../../utils/constants';
import Proposal, { NEW_PROPOSAL } from '../../../utils/types/proposal';
import { Box } from '@mui/material';

const PAGE = 9;
const PAGE_INNER = 0;
const PAGE_FOOTER = -1;

export default function AddProposal() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  React.useEffect(() => {
    updateAppContent1(EMPTY_STATUS);
    updateAppContent2(NEW_PROPOSAL);
  }, []);

  const contentValid = () => !(getProposal()?.title?.length > 0 && getProposal()?.proposalType > 0);

  return (
    <Box pt={2}>
      <Shell page={PAGE} footerPage={PAGE_FOOTER} buttonDisabled={contentValid()}>
        <TitleEntry page={PAGE_INNER} />
      </Shell>
    </Box>
  );
}
