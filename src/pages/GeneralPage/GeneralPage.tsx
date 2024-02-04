import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
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
    const temp = [];
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
    <FieldWrapper label={t('cycle.label')}>
      <Typography>
        <strong>{GENERAL.Cycle}</strong>
      </Typography>
    </FieldWrapper>
  );

  const abstractField = () => {
    const MAX_CHAR = 250;

    const setValue = (e: string) => {
      setProposal({ ...getProposal(), abstract: e.substring(0, MAX_CHAR) });
    };

    return (
      <FieldWrapper label={t('abstract.label')}>
        <TextEntry
          label=""
          testId="abstractId"
          rows={10}
          value={getProposal().abstract}
          setValue={(e: string) => setValue(e)}
          onFocus={() => helpComponent(t('abstract.help'))}
          helperText={t('abstract.helper')}
        />
      </FieldWrapper>
    );
  };

  const categoryField = () => (
    <FieldWrapper label={t('scienceCategory.label')}>
      <DropDown
        options={GENERAL.ScienceCategory}
        testId="categoryId"
        value={getProposal().category}
        setValue={checkCategory}
        label=""
        onFocus={() => helpComponent(t('scienceCategory.help'))}
      />
    </FieldWrapper>
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
