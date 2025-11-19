import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { GENERAL, LAB_POSITION, PAGE_GENERAL } from '@utils/constants.ts';
import { countWords } from '@utils/helpers.ts';
import { Proposal } from '@utils/types/proposal.tsx';
import { validateGeneralPage } from '@utils/validation/validation.tsx';
import { useTheme } from '@mui/material/styles';
import Shell from '../../components/layout/Shell/Shell';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

const PAGE = PAGE_GENERAL;
const LINE_OFFSET = 30;
const LABEL_WIDTH = 3;

export default function GeneralPage() {
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();
  const theme = useTheme();

  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { osdCloses, osdOpens } = useOSDAccessors();

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

  const cycleIdField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycle.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH}
      testId="cycleId"
      value={getProposal().cycle}
      onFocus={() => helpComponent(t('abstract.help'))}
      disabled
    />
  );

  const cycleClosesField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycleCloses.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH}
      testId="cycleCloses"
      value={osdCloses(true)}
      onFocus={() => helpComponent(t('abstract.help'))}
      disabled
    />
  );

  const cycleOpensField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycleOpens.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH}
      testId="cycleOpens"
      value={osdOpens(true)}
      onFocus={() => helpComponent(t('abstract.help'))}
      disabled
    />
  );

  const abstractField = () => {
    const MAX_CHAR = Number(t('abstract.maxChar'));
    const MAX_WORD = Number(t('abstract.maxWord'));
    const numRows = Number(t('abstract.minDisplayRows'));

    const setValue = (e: string) => {
      if (countWords(e) < MAX_WORD || (countWords(e) === MAX_WORD && !/\s$/.test(e))) {
        setProposal({ ...getProposal(), abstract: e.substring(0, MAX_CHAR) });
      }
    };

    const helperFunction = (abstract: string) => {
      const color = theme.palette.error.dark;

      const baseHelperText = t('abstract.helper', {
        current: countWords(abstract),
        max: MAX_WORD
      });
      return countWords(abstract) === MAX_WORD ? (
        <>
          {baseHelperText} <span style={{ color: color }}>(MAX WORD COUNT REACHED)</span>
        </>
      ) : (
        baseHelperText
      );
    };

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
          helperText={helperFunction(getProposal().abstract as string)}
          errorText={validateWordCount(getProposal().abstract as string)}
          suffix={<ViewIcon onClick={handleOpenAbstractLatexModal} toolTip="preview latex" />}
        />
        <LatexPreviewModal
          value={getProposal().abstract as string}
          open={openAbstractLatexModal}
          onClose={handleCloseAbstractLatexModal}
          title={t('abstract.latexPreviewTitle')}
        />
      </Box>
    );
  };

  const categoryField = () => (
    <DropDown
      options={isSV() ? GENERAL.ObservingMode : GENERAL.ScienceCategory}
      errorText={getProposal().scienceCategory ? '' : t('scienceCategory.error')}
      required
      testId="categoryId"
      value={getProposal().scienceCategory ?? ''}
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
            <Grid size={{ md: 12 }}>{cycleIdField()}</Grid>
            <Grid size={{ md: 12 }}>{cycleOpensField()}</Grid>
            <Grid size={{ md: 12 }}>{cycleClosesField()}</Grid>
            <Grid pt={2} pb={2} size={{ md: 12, lg: 12 }}>
              <Grid size={{ md: 12, lg: 6 }}>{categoryField()}</Grid>
            </Grid>
            <Grid size={{ md: 12 }}>{abstractField()}</Grid>
          </Grid>
          <Grid size={{ md: 6 }}></Grid>
        </Grid>
      </Grid>
    </Shell>
  );
}
