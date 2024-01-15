import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import { GENERAL, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';
import { Help } from '../../../services/types/help';
import { Proposal } from '../../../services/types/proposal';

export const HELP_ABSTRACT = {
  title: 'ABSTRACT TITLE',
  description: 'ABSTRACT DESCRIPTION',
  additional: ''
};
export const HELP_CATEGORY = {
  title: 'CATEGORY TITLE',
  description: 'CATEGORY DESCRIPTION',
  additional: ''
};
export const HELP_SUBCATEGORY = {
  title: 'SUBCATEGORY TITLE',
  description: 'SUBCATEGORY DESCRIPTION',
  additional: ''
};

interface GeneralContentProps {
  help: Help;
  page: number;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
  setStatus: Function;
}

export default function GeneralContent({
  help,
  page,
  proposal,
  setHelp,
  setProposal,
  setStatus
}: GeneralContentProps) {
  const [validateToggle, setValidateToggle] = React.useState(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [proposal]);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_PARTIAL, STATUS_OK];
    let count = 0;

    if (proposal?.abstract?.length > 0) {
      count++;
    }
    if (proposal?.category > 0) {
      count++;
    }
    if (proposal?.subCategory > 0) {
      count++;
    }

    setStatus([page, result[count]]);
  }, [validateToggle]);

  const checkCategory = (id: number) => {
    setProposal({ ...proposal, category: id, subCategory: 1 });
  };

  const getSubCategoryOptions = () => {
    if (proposal.category) {
      return GENERAL.ScienceCategory[proposal.category - 1].subCategory;
    }
    return [{ label: '', value: 0 }];
  };

  const abstractField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid mt={2} item xs={2}>
        <Typography>Abstract</Typography>
      </Grid>
      <Grid item xs={10}>
        <TextEntry
          label=""
          testId="abstractId"
          rows={10}
          value={proposal.abstract}
          setValue={e => setProposal({ ...proposal, abstract: e })}
          onFocus={() => setHelp(HELP_ABSTRACT)}
          helperText="Please enter your abstract information"
        />
      </Grid>
    </Grid>
  );

  const cycleField = () => (
    <Grid container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item xs={2}>
        <Typography>Cycle</Typography>
      </Grid>
      <Grid item xs={10}>
        <Typography>
          <strong>{GENERAL.Cycle}</strong>
        </Typography>
      </Grid>
    </Grid>
  );

  const categoryField = () => (
    <Grid pt={2} container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item xs={4}>
        <Typography>Scientific category</Typography>
      </Grid>
      <Grid item xs={8}>
        <DropDown
          options={GENERAL.ScienceCategory}
          testId="categoryId"
          value={proposal.category}
          setValue={checkCategory}
          label=""
          onFocus={() => setHelp(HELP_CATEGORY)}
        />
      </Grid>
    </Grid>
  );

  const subCategoryField = () => (
    <Grid pt={2} container direction="row" alignItems="baseline" justifyContent="flex-start">
      <Grid item xs={6}>
        <Typography>Scientific sub-category</Typography>
      </Grid>
      <Grid item xs={6}>
        <DropDown
          options={getSubCategoryOptions()}
          disabled={
            proposal.category < 1 ||
            GENERAL.ScienceCategory[proposal.category - 1].subCategory.length < 2
          }
          testId="subCategoryId"
          value={proposal.subCategory}
          setValue={(e: number) => setProposal({ ...proposal, subCategory: e })}
          label=""
          onFocus={() => setHelp(HELP_SUBCATEGORY)}
        />
      </Grid>
    </Grid>
  );

  return (
    <Grid
      container
      direction="row"
      spacing={1}
      alignItems="space-evenly"
      justifyContent="space-around"
    >
      <Grid item xs={1} />
      <Grid item xs={8}>
        {cycleField()}
        {abstractField()}
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="space-evenly"
          spacing={1}
        >
          <Grid item xs={6}>
            {categoryField()}
          </Grid>
          <Grid item xs={6}>
            {subCategoryField()}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={3}>
        <InfoPanel title={help.title} description={help.description} additional={help.additional} />
      </Grid>
    </Grid>
  );
}
