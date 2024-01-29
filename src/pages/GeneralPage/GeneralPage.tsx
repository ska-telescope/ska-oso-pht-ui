import React from 'react';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import HelpPanel from '../../components/helpPanel/helpPanel';
import Shell from '../../components/layout/Shell/Shell';
import { GENERAL, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import { Proposal } from '../../services/types/proposal';
import { helpers } from '../../utils/helpers';

export const HELP_ABSTRACT = ['ABSTRACT TITLE', 'ABSTRACT DESCRIPTION', ''];
export const HELP_CATEGORY = ['CATEGORY TITLE', 'CATEGORY DESCRIPTION', ''];
export const HELP_SUBCATEGORY = ['SUBCATEGORY TITLE', 'SUBCATEGORY DESCRIPTION', ''];

const PAGE = 2;

export default function GeneralPage() {
  const {
    application,
    helpComponent,
    updateAppContent1,
    updateAppContent2
  } = storageObject.useStore();
  const [, setFormInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [, setAbstract] = React.useState('');
  const [errorTextAbstract, setErrorTextAbstract] = React.useState('');

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const MAXCHART = 250;

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(HELP_ABSTRACT);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_PARTIAL, STATUS_OK];
    let count = 0;

    if (getProposal()?.abstract?.length > 0) {
      count++;
    }
    if (getProposal()?.category > 0) {
      count++;
    }
    if (getProposal()?.subCategory > 0) {
      count++;
    }

    setTheProposalState(result[count]);
  }, [validateToggle]);

  function formValidation() {
    let count = 0;

    // abstract
    const emptyField = getProposal()?.abstract === '';
    let isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
          getProposal()?.abstract,
          setAbstract,
          setErrorTextAbstract,
          'DEFAULT',
          MAXCHART
      );
      if (isValid) { 
        setErrorTextAbstract(''); // clean up residual errors if valid otherwise MAXLENGTH error still shows
      }
      count += isValid ? 0 : 1;
    } else {
      setErrorTextAbstract(''); // don't display error when empty
    }
    return count;
  }

  React.useEffect(() => {
    const invalidForm = Boolean(formValidation()); // calls formValidation function
    setFormInvalid(invalidForm);
  }, [validateToggle]);

  const checkCategory = (id: number) => {
    setProposal({ ...getProposal(), category: id, subCategory: 1 });
  };

  const getSubCategoryOptions = () => {
    if (getProposal().category) {
      return GENERAL.ScienceCategory[getProposal().category - 1].subCategory;
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
          value={getProposal().abstract}
          setValue={e => setProposal({ ...getProposal(), abstract: e })}
          onFocus={() => helpComponent(HELP_ABSTRACT)}
          helperText="Please enter your abstract information"
          errorText={errorTextAbstract}
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
          value={getProposal().category}
          setValue={checkCategory}
          label=""
          onFocus={() => helpComponent(HELP_CATEGORY)}
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
            getProposal().category < 1 ||
            GENERAL.ScienceCategory[getProposal().category - 1].subCategory.length < 2
          }
          testId="subCategoryId"
          value={getProposal().subCategory}
          setValue={(e: number) => setProposal({ ...getProposal(), subCategory: e })}
          label=""
          onFocus={() => helpComponent(HELP_SUBCATEGORY)}
        />
      </Grid>
    </Grid>
  );

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
          <HelpPanel />
        </Grid>
      </Grid>
    </Shell>
  );
}
