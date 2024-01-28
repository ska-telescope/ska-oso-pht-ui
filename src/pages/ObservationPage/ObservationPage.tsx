import React from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, TickBox } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import AddObservationButton from '../../components/button/AddObservation/AddObservationButton';
import { Proposal } from '../../services/types/proposal';
import { OBSERVATION, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';

const PAGE = 5;

export default function ObservationPage() {
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentObservation, setCurrentObservation] = React.useState(0);
  const [linked, setLinked] = React.useState(true);
  const [unlinked, setUnlinked] = React.useState(true);

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

  const deleteIconClicked = () => {
    // TODO : Display confirmation and if confirm, delete
  };

  const AddObservationTarget = (id: number) => {
    const rec = { observationId: currentObservation, targetId: id };
    setProposal({ ...getProposal(), targetObservation: [...getProposal().targetObservation, rec] });
  };

  function filterRecords(id: number) {
    return getProposal().targetObservation.filter(
      item => !(item.observationId === currentObservation && item.targetId === id)
    );
  }

  const DeleteObservationTarget = (id: number) => {
    setProposal({ ...getProposal(), targetObservation: filterRecords(id) });
  };

  const isTargetLinked = (id: number) =>
    getProposal().targetObservation.filter(
      entry => entry.observationId === currentObservation && entry.targetId === id
    ).length > 0;

  const targetLinkToggle = (id: number) => {
    if (isTargetLinked(id)) {
      DeleteObservationTarget(id);
    } else {
      AddObservationTarget(id);
    }
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = getProposal().observations.length > 0 ? 1 : 0;
    count += getProposal().targets.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const columns = [
    {
      field: 'telescope',
      headerName: 'Telescope',
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number } }) => (
        <Typography>{OBSERVATION.array[e.row.telescope].label}</Typography>
      )
    },
    {
      field: 'subarray',
      headerName: 'Array',
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number; subarray: number } }) => (
        <Typography>{OBSERVATION.array[e.row.telescope].subarray[e.row.subarray].label}</Typography>
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { type: number } }) => (
        <Typography>{OBSERVATION.ObservationType[e.row.type].label}</Typography>
      )
    },
    {
      field: 'id',
      headerName: 'Actions',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number; }; }) => <TrashIcon onClick={deleteIconClicked} selected={e.row.id === currentObservation} toolTip="Delete target" />
    }
  ];
  const extendedColumnsObservations = [...columns];

  const columnsTargets = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'ra', headerName: 'Right Ascension', width: 150 },
    { field: 'dec', headerName: 'Declination', width: 150 }
  ];
  const columnsTargetsSelected = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'ra', headerName: 'Right Ascension', width: 150 },
    { field: 'dec', headerName: 'Declination', width: 150 },
    {
      field: 'id',
      headerName: 'Linked',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => {
        if (currentObservation > 0) {
          return (
            <TickBox
              label=""
              testId="linkedTickBox"
              checked={isTargetLinked(e.row.id)}
              onChange={() => targetLinkToggle(e.row.id)}
            />
          );
        }
        return '';
      }
    }
  ];
  const extendedColumnsTargets = [...columnsTargets];
  const extendedColumnsTargetsSelected = [...columnsTargetsSelected];

  const clickFunction = () => {
    // TODO
  };

  const ClickObservationRow = (e: { id: number }) => {
    setCurrentObservation(e.id);
  };

  const filteredTargets = () => {
    const list = getProposal().targets;
    if (linked) {
      if (unlinked) {
        return list;
      }
      return list.filter(e => isTargetLinked(e.id));
    }
    if (unlinked) {
      return list.filter(e => !isTargetLinked(e.id));
    }
    return [];
  };

  return (
    <Shell page={PAGE}>
      <Grid
        spacing={1}
        p={3}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid item xs={5}>
          <Grid container direction="column" alignItems="flex-start" justifyContent="space-around">
            <Grid item pb={1}>
              <AddObservationButton />
            </Grid>
            <DataGrid
              rows={getProposal().observations}
              columns={extendedColumnsObservations}
              height={450}
              onRowClick={ClickObservationRow}
              showBorder={false}
              testId="observationDetails"
            />
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <Grid pt={2} container alignItems="space-evenly" justifyContent="space-around">
              <Grid item>
                <Typography pt={1} variant="h6">
                  Target List related to the selected Observation
                </Typography>
              </Grid>
              <Grid item>
                <TickBox
                  disabled={currentObservation === 0}
                  label="Linked"
                  testId="linkedTickBox"
                  checked={linked}
                  onChange={() => setLinked(!linked)}
                />
              </Grid>
              <Grid item>
                <TickBox
                  disabled={currentObservation === 0}
                  label="Unlinked"
                  testId="unlinkedTickBox"
                  checked={unlinked}
                  onChange={() => setUnlinked(!unlinked)}
                />
              </Grid>
            </Grid>
            <CardContent>
              <DataGrid
                rows={filteredTargets()}
                columns={
                  currentObservation > 0 ? extendedColumnsTargetsSelected : extendedColumnsTargets
                }
                height={390}
                onColumnVisibilityModelChange={clickFunction}
                showBorder={false}
                testId="linkedTargetDetails"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Shell>
  );
}
