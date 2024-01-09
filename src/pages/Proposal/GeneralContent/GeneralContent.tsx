import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import InfoPanel from '../../../components/infoPanel/infoPanel';
import {
  DEFAULT_HELP,
  GENERAL,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL
} from '../../../utils/constants';

// TODO : Migrate the help to the parent so it is more dynamic

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
  page: number;
  setStatus: Function;
}

export default function GeneralContent({ page, setStatus }: GeneralContentProps) {
  const [abstract, setAbstract] = React.useState('');
  const [category, setCategory] = React.useState(0);
  const [subCategory, setSubCategory] = React.useState(0);
  const [help, setHelp] = React.useState(DEFAULT_HELP);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_PARTIAL, STATUS_OK];
    let count = 0;

    if (abstract?.length > 0) {
      count++;
    }
    if (category && category > 0) {
      count++;
    }
    if (subCategory && subCategory > 0) {
      count++;
    }

    setStatus([page, result[count]]);
  }, [setStatus, abstract, category, subCategory]);

  const checkCategory = e => {
    setCategory(e);
    if (e > 0 && GENERAL.ScienceCategory[e - 1].subCategory) {
      setSubCategory(1); // Ensure a value is initially selected
    }
  };

  const getSubCategoryOptions = () => {
    if (category) {
      return GENERAL.ScienceCategory[category - 1].subCategory;
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
          value={abstract}
          setValue={setAbstract}
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
        <Typography>Scientific Category</Typography>
      </Grid>
      <Grid item xs={8}>
        <DropDown
          options={GENERAL.ScienceCategory}
          testId="categoryId"
          value={category}
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
          disabled={!category || GENERAL.ScienceCategory[category - 1].subCategory.length < 2}
          testId="subCategoryId"
          value={subCategory}
          setValue={setSubCategory}
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
