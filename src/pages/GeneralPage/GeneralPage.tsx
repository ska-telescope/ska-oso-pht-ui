import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import HelpPanel from '../../components/helpPanel/helpPanel';
import Shell from '../../components/layout/Shell/Shell';
import { GENERAL, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { Proposal } from '../../services/types/proposal';

const PAGE = 2;

export default function GeneralPage() {
  const { t } = useTranslation('pht');

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

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(t('abstract.help'));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = 0;

    if (getProposal()?.abstract?.length > 0) {
      count++;
    }
    if (getProposal()?.category > 0) {
      count++;
    }
    /* TODO : Retained for future use
    if (getProposal()?.subCategory > 0) {
      count++;
    }
    */

    setTheProposalState(result[count]);
  }, [validateToggle]);

  const checkCategory = (id: number) => {
    setProposal({ ...getProposal(), category: id, subCategory: 1 });
  };

  /* TODO : Retained for future use
  const getSubCategoryOptions = () => {
    if (getProposal().category) {
      return GENERAL.ScienceCategory[getProposal().category - 1].subCategory;
    }
    return [{ label: '', value: 0 }];
  };
  */

  const cycleField = () => (
    <Grid container mb={1} direction="row" justifyContent="center" alignItems="center" spacing={2}>
      <Grid item xs={4}>
        <Typography sx={{ fontWeight: 'bold' }} variant="subtitle1">
          {t('cycle.label') + ' *'}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="subtitle1">{GENERAL.Cycle}</Typography>
      </Grid>
    </Grid>
  );

  const abstractField = () => {
    const MAX_CHAR = Number(t('abstract.maxChar'));
    const MAX_WORD = Number(t('abstract.maxWord'));

    const setValue = (e: string) => {
      setProposal({ ...getProposal(), abstract: e.substring(0, MAX_CHAR) });
    };

    const countWords = (text: string) => {
      if (text === 'undefined' || text === null) return 0;

      return text
        ?.trim()
        .split(/\s+/)
        .filter(Boolean).length;
    };

    const helperFunction = (title: string) =>
      `${t('abstract.helper')} - ${t('specialCharacters.cntWord')} ${countWords(
        title
      )} / ${MAX_WORD}`;

    return (
      <TextEntry
        label={t('abstract.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        testId="abstractId"
        rows={t('abstract.rows')}
        value={getProposal().abstract}
        setValue={(e: string) => setValue(e)}
        onFocus={() => helpComponent(t('abstract.help'))}
        helperText={helperFunction(getProposal().abstract)}
      />
    );
  };

  const categoryField = () => (
    <DropDown
      options={GENERAL.ScienceCategory}
      testId="categoryId"
      value={getProposal().category}
      select
      setValue={checkCategory}
      label={t('scienceCategory.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      onFocus={() => helpComponent(t('scienceCategory.help'))}
    />
  );

  /* TODO : Retained for future use
  const subCategoryField = () => (
    <Grid pt={2} container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item xs={6}>
        <Typography>{t('scienceSubCategory.label')}</Typography>
      </Grid>
      <Grid item xs={6}>
        <DropDown
          options={getSubCategoryOptions()}
          disabled={
            getProposal().category < 1 ||
            GENERAL.ScienceCategory[getProposal().category - 1].subCategory.length < 2
          }
          testId="subCategoryId"
          value={getProposal().subCategory}
          setValue={(e: number) => setProposal({ ...getProposal(), subCategory: e })}
          label=""
          onFocus={() => helpComponent(t('scienceSubCategory.help'))}
        />
      </Grid>
    </Grid>
  );
  */

  return (
    <Shell page={PAGE}>
      <Grid
        container
        direction="row"
        p={3}
        spacing={1}
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid item xs={8}>
          {cycleField()}
          {abstractField()}
          {categoryField()}
        </Grid>
        <Grid item xs={3}>
          <HelpPanel />
        </Grid>
      </Grid>
    </Shell>
  );
}
