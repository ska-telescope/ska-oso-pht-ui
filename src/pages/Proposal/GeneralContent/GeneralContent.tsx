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

interface GeneralContentProps {
  page: number;
  setStatus: Function;
}

export default function GeneralContent({ page, setStatus }: GeneralContentProps) {
  const [abstract, setAbstract] = React.useState(GENERAL.Abstract);
  const [category, setCategory] = React.useState(1);
  const [subCategory, setSubCategory] = React.useState(1);
  const [help] = React.useState(DEFAULT_HELP);

  React.useEffect(() => {
    if (typeof setStatus !== 'function') {
      return;
    }
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    const count = 0;

    // TODO : Increment the count for every passing element of the page.
    // This is then used to take the status from the result array
    // In the default provided, the count must be 2 for the page to pass.

    // See titleContent page for working example

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
            />
          </Grid>
          <Grid item xs={3}>
            <DropDown
              options={GENERAL.ScienceCategory}
              testId="{tt}"
              value={category}
              setValue={setCategory}
              label="Scientific Category"
            />
            <DropDown
              options={GENERAL.ScienceSubCategory}
              testId="{tt}"
              value={subCategory}
              setValue={setSubCategory}
              label="Scientific sub-category"
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
