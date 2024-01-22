import React from 'react';
import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import { TickBox } from '@ska-telescope/ska-gui-components';
import AddObservationButton from '../../../components/button/AddObservation/AddObservationButton';
import DataGridWrapper from '../../../components/wrappers/dataGridWrapper/dataGridWrapper';
import { Proposal } from '../../../services/types/proposal';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../../utils/constants';

interface ObservationContentProps {
  page: number;
  proposal: Proposal;
  setStatus: Function;
}

export default function ObservationContent({ page, proposal, setStatus }: ObservationContentProps) {
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [linked] = React.useState(true);
  const [unlinked] = React.useState(true);

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
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = proposal.observations.length > 0 ? 1 : 0;
    count += proposal.targets.length > 0 ? 1 : 0;
    setStatus([page, result[count]]);
  }, [validateToggle]);

  const columnsObservations = [
    { field: 'array', headerName: 'Array', minWidth: 100 },
    { field: 'subarray', headerName: 'Subarray', minWidth: 200 },
    { field: 'linked', headerName: 'Linked Targets', minWidth: 200 },
    { field: 'type', headerName: 'Type', minWidth: 100 }
  ];
  const extendedColumnsObservations = structuredClone(columnsObservations);

  const columnsTargets = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'ra', headerName: 'Right Ascension', width: 150 },
    { field: 'dec', headerName: 'Declination', width: 150 }
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
                rows={proposal.observations}
                extendedColumns={extendedColumnsObservations}
                height={450}
                rowClick={ClickFunction}
              />
            </Grid>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={6}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Typography variant="h6">
                    Target List related to the selected Observation
                  </Typography>
                }
              />
              <CardContent>
                <TickBox label="Linked" testId="linkedTickBox" checked={linked} />
                <TickBox label="Unlinked" testId="unlinkedTickBox" checked={unlinked} />
                <DataGridWrapper
                  rows={proposal.targets}
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
