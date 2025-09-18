import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import HelpPanel from '../../components/info/helpPanel/HelpPanel';
import Shell from '../../components/layout/Shell/Shell';
import { GENERAL, LAB_POSITION } from '../../utils/constants';
import { countWords } from '../../utils/helpers';
import { Proposal } from '../../utils/types/proposal';
import { validateGeneralPage } from '../../utils/proposalValidation';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const PAGE = 2;
const LINE_OFFSET = 30;
const LABEL_WIDTH = 2;
const HELP_VIEWPORT = '40vh';

export default function GeneralPage() {
  const { t } = useScopedTranslation();

  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const [openAbstractLatexModal, setOpenAbstractLatexModal] = React.useState(false);
  const handleOpenAbstractLatexModal = () => setOpenAbstractLatexModal(true);
  const handleCloseAbstractLatexModal = () => setOpenAbstractLatexModal(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(t('scienceCategory.help'));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateGeneralPage(getProposal()));
  }, [validateToggle]);

  const checkCategory = (id: number) => {
    setProposal({ ...getProposal(), scienceCategory: id, scienceSubCategory: [1] });
  };

  const cycleField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycle.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH * 2}
      testId="cycleId"
      value={getProposal().cycle}
      onFocus={() => helpComponent(t('abstract.help'))}
      required
      disabled
    />
  );

  const abstractField = () => {
    const MAX_CHAR = Number(t('abstract.maxChar'));
    const MAX_WORD = Number(t('abstract.maxWord'));
    const numRows = Number(t('abstract.minDisplayRows'));

    const setValue = (e: string) => {
      setProposal({ ...getProposal(), abstract: e.substring(0, MAX_CHAR) });
    };

    const helperFunction = (title: string) =>
      t('abstract.helper', {
        current: countWords(title),
        max: MAX_WORD
      });

    function validateWordCount(title: string) {
      if (countWords(title) > MAX_WORD) {
        return `${t('specialCharacters.numWord')} ${countWords(title)} / ${MAX_WORD}`;
      }
    }

    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <TextEntry
          label={t('abstract.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="abstractId"
          rows={numRows}
          required
          value={getProposal().abstract}
          setValue={(e: string) => setValue(e)}
          onFocus={() => helpComponent(t('abstract.help'))}
          helperText={helperFunction(getProposal().abstract)}
          errorText={validateWordCount(getProposal().abstract)}
          suffix={<ViewIcon onClick={handleOpenAbstractLatexModal} toolTip="preview latex" />}
        />
        <LatexPreviewModal
          value={getProposal().abstract}
          open={openAbstractLatexModal}
          onClose={handleCloseAbstractLatexModal}
          title={t('abstract.latexPreviewTitle')}
        />
      </Box>
    );
  };

  const categoryField = () => (
    <DropDown
      options={GENERAL.ScienceCategory}
      errorText={getProposal().scienceCategory ? '' : t('scienceCategory.error')}
      required
      testId="categoryId"
      value={getProposal().scienceCategory}
      setValue={checkCategory}
      label={t('scienceCategory.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH * 2}
      onFocus={() => helpComponent(t('scienceCategory.help'))}
    />
  );

  return (
    <Shell page={PAGE}>
      <Grid
        container
        direction="row"
        p={3}
        spacing={2}
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid pb={3} size={{ md: 12, lg: 8 }}>
          <Grid container direction="row">
            <Grid pt={2} size={{ md: 12, lg: 12 }}>
              <Grid size={{ md: 12, lg: 6 }}>{cycleField()}</Grid>
            </Grid>
            <Grid pt={2} pb={2} size={{ md: 12, lg: 12 }}>
              <Grid size={{ md: 12, lg: 6 }}>{categoryField()}</Grid>
            </Grid>
            <Grid size={{ md: 12 }}>{abstractField()}</Grid>
          </Grid>
          <Grid size={{ md: 6 }}></Grid>
        </Grid>
        <Grid size={{ md: 12, lg: 3 }}>
          <HelpPanel maxHeight={HELP_VIEWPORT} />
        </Grid>
      </Grid>
    </Shell>
  );
}
