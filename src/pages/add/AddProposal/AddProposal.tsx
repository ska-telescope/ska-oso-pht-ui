import React from 'react';
import { storageObject } from '@utils/storage/store';
import { Box } from '@mui/material';
import { EMPTY_STATUS, PAGE_TITLE_ADD, PROPOSAL_TYPE, TYPE_CONTINUUM } from '@utils/constants.ts';
import Shell from '../../../components/layout/Shell/Shell';
import TitleEntry from '../../entry/TitleEntry/TitleEntry';
import Proposal, { NEW_PROPOSAL } from '../../../utils/types/proposal';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { newDataProductsForMode, newObservationForMode } from '@/utils/autoLinking/AutoLinking';
import { countWords } from '@utils/helpers.ts';
import phtTranslations from '../../../../public/locales/en/pht.json';

const PAGE = PAGE_TITLE_ADD;
const PAGE_INNER = 0;
const PAGE_FOOTER = -1;

export default function AddProposal() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const { isSV } = useOSDAccessors();
  const getProposal = () => application.content2 as Proposal;

  // SV proposals have a single observation whose type is the observing mode, so they start with
  // one in the default mode, which the user can change on the Details page.
  const defaultObservation = () => {
    const observation = newObservationForMode(TYPE_CONTINUUM);
    return { observations: [observation], dataProductSDP: newDataProductsForMode(observation) };
  };

  // SV cycles have no type picker, so a new SV proposal gets its type straight away. The cycle
  // is always selected on the Landing page before this page opens.
  React.useEffect(() => {
    const proposalType = isSV ? PROPOSAL_TYPE.SCIENCE_VERIFICATION : undefined;
    updateAppContent1(EMPTY_STATUS);
    updateAppContent2({
      ...NEW_PROPOSAL,
      proposalType,
      ...(proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION && defaultObservation())
    });
  }, []);

  const maxTitleWords = Number(phtTranslations.title.maxWord);
  const titleValid = () =>
    getProposal()?.title?.length > 0 && countWords(getProposal()?.title) <= maxTitleWords;
  const typeValid = () => !!getProposal()?.proposalType;
  const contentValid = () => titleValid() && typeValid();

  return (
    <Box pt={2}>
      <Shell page={PAGE} footerPage={PAGE_FOOTER} buttonDisabled={!contentValid()} helpDisabled>
        <TitleEntry page={PAGE_INNER} />
      </Shell>
    </Box>
  );
}
