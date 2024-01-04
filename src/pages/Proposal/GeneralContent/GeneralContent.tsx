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

// TODO : Category & sub-category need the correct content
// TODO : Update the onFocus functions for dropdowns once the ska-gui-components have been updated
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
  const [abstract, setAbstract] = React.useState(GENERAL.Abstract);
  const [category, setCategory] = React.useState();
  const [subCategory, setSubCategory] = React.useState();
  const [help, setHelp] = React.useState(DEFAULT_HELP);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_PARTIAL, STATUS_OK];
    let count = 0;

    if (abstract?.length > 0) { count++ }
    if (category && category > 0) { count++ }
    if (subCategory && subCategory > 0) { count++ }

    setStatus([page, result[count]]);
  }, [setStatus]);

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <Grid container direction="row" alignItems="center" justifyContent="center">
          <Typography variant="body1" m={2}>
            Cycle
          </Typography>
          <Typography variant="h6" m={2}>
            <strong>{GENERAL.Cycle}</strong>
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="row" alignItems="center" justifyContent="space-evenly">
          <Grid item xs={4}>
            <TextEntry
              label="Abstract"
              testId="abstractId"
              rows={10}
              value={abstract}
              setValue={setAbstract}
              onFocus={() => setHelp(HELP_ABSTRACT)}
            />
          </Grid>
          <Grid item xs={3}>
            <DropDown
              options={GENERAL.ScienceCategory}
              testId="categoryId"
              value={category}
              setValue={setCategory}
              label="Scientific Category"
              // TODO onFocus={() => setHelp(HELP_CATEGORY)}
            />
            <DropDown
              options={GENERAL.ScienceSubCategory}
              testId="subCategoryId"
              value={subCategory}
              setValue={setSubCategory}
              label="Scientific sub-category"
              // TODO onFocus={() => setHelp(HELP_SUBCATEGORY)}
            />
          </Grid>
          <Grid item xs={3}>
            <InfoPanel
              title={help.title}
              description={help.description}
              additional={help.additional}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
