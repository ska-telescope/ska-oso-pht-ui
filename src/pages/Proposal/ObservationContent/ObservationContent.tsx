import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography
} from '@mui/material';
import AddObservationButton from '../../../components/button/AddObservation/AddObservationButton';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import SensCalcButton from '../../../components/button/SensCalc/SensCalcButton';
import {
  OBSERVATION,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL,
  TARGETS
} from '../../../utils/constants';

interface ObservationContentProps {
  page: number;
  setStatus: Function;
}

export default function ObservationContent({ page, setStatus }: ObservationContentProps) {
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

  const columnsObservations = [
    { field: 'array', headerName: 'Array', minWidth: 100 },
    { field: 'subarray', headerName: 'Subarray', minWidth: 200 },
    { field: 'linked', headerName: 'Linked Targets', minWidth: 200 },
    { field: 'type', headerName: 'Type', minWidth: 100 }
  ];
  const extendedColumnsObservations = structuredClone(columnsObservations);

  const columnsTargets = [
    { field: 'Name', headerName: 'Name', minWidth: 200 },
    { field: 'RA', headerName: 'Right Ascension ( hh:mm:ss:s )', minWidth: 300 },
    { field: 'Dec', headerName: 'Declination ( dd:mm:ss:s )', width: 300 }
  ];
  const extendedColumnsTargets = structuredClone(columnsTargets);

  const ClickFunction = () => {
    // TODO
  };

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <Grid
          p={1}
          container
          direction="row"
          alignItems="space-evenly"
          justifyContent="space-around"
        >
          <Grid item xs={5}>
            <Grid
              container
              direction="column"
              alignItems="flex-start"
              justifyContent="space-around"
            >
              <Grid item pb={1}>
                <AddObservationButton />
              </Grid>
              <DataGridWrapper
                rows={OBSERVATION.list}
                extendedColumns={extendedColumnsObservations}
                height={450}
                rowClick={ClickFunction}
              />
            </Grid>
          </Grid>
          <Grid item xs={7}>
            <Card variant="outlined">
              <CardHeader
                action={<SensCalcButton />}
                title={
                  <Typography variant="h6">
                    Target List related to the selected Observation
                  </Typography>
                }
              />
              <CardContent>
                <FormControlLabel
                  value="linked"
                  control={
                    <Checkbox
                      defaultChecked
                      sx={{
                        '&.Mui-checked': {
                          color: 'green'
                        }
                      }}
                    />
                  }
                  label="Linked"
                  labelPlacement="end"
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                />
                <FormControlLabel
                  value="unlinked"
                  control={
                    <Checkbox
                      sx={{
                        '&.Mui-checked': {
                          color: 'green'
                        }
                      }}
                    />
                  }
                  label="Unlinked"
                  labelPlacement="end"
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                />
                <DataGridWrapper
                  rows={TARGETS.ListOfTargets.TargetItems}
                  extendedColumns={extendedColumnsTargets}
                  height={350}
                  rowClick={ClickFunction}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
