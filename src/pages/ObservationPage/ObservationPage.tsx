import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, TickBox } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import AddObservationButton from '../../components/button/AddObservation/AddObservationButton';
import { Proposal } from '../../services/types/proposal';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';

const PAGE = 5;

export default function ObservationPage() {
  const { t } = useTranslation('pht');

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentObservation, setCurrentObservation] = React.useState(0);
  const [selected, setSelected] = React.useState(true);
  const [notSelected, setNotSelected] = React.useState(true);

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

  const isTargetSelected = (id: number) =>
    getProposal().targetObservation.filter(
      entry => entry.observationId === currentObservation && entry.targetId === id
    ).length > 0;

  const targetSelectedToggle = (id: number) => {
    if (isTargetSelected(id)) {
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
      headerName: t('label.telescope'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number } }) => (
        <Typography>{t(`dropdown.telescope.${  e.row.telescope  }.title`)}</Typography>
      )
    },
    {
      field: 'subarray',
      headerName: t('label.array'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number; subarray: number } }) => 
        { 
          if (e.row.telescope) { 
            return <Typography>{t(`dropdown.telescope.${  e.row.telescope  }.array.${  e.row.subarray  }`)}</Typography>;
          }
          return <Typography>{t("dropdown.telescope.0.title")}</Typography>
        }
    },
    {
      field: 'type',
      headerName: t('column.type'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { type: number } }) => (
        <Typography>{t(`dropdown.observationType.${  e.row.type  }`)}</Typography>
      )
    },
    {
      field: 'id',
      headerName: t('column.actions'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => (
        <TrashIcon
          onClick={deleteIconClicked}
          selected={e.row.id === currentObservation}
          toolTip="Delete target"
        />
      )
    }
  ];
  const extendedColumnsObservations = [...columns];

  const columnsTargets = [
    { field: 'name', headerName: t('label.name'), width: 200 },
    { field: 'ra', headerName: t('label.rightAscension'), width: 150 },
    { field: 'dec', headerName: t('label.declination'), width: 150 }
  ];
  const columnsTargetsSelected = [
    { field: 'name', headerName: t('label.name'), width: 200 },
    { field: 'ra', headerName: t('label.rightAscension'), width: 150 },
    { field: 'dec', headerName: t('label.declination'), width: 150 },
    {
      field: 'id',
      headerName: t('label.selected'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => {
        if (currentObservation > 0) {
          return (
            <TickBox
              label=""
              testId="linkedTickBox"
              checked={isTargetSelected(e.row.id)}
              onChange={() => targetSelectedToggle(e.row.id)}
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
    if (selected) {
      if (notSelected) {
        return list;
      }
      return list.filter(e => isTargetSelected(e.id));
    }
    if (notSelected) {
      return list.filter(e => !isTargetSelected(e.id));
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
                  {t('label.targetObservation')}
                </Typography>
              </Grid>
              <Grid item>
                <TickBox
                  disabled={currentObservation === 0}
                  label="Selected"
                  testId="selectedTickBox"
                  checked={selected}
                  onChange={() => setSelected(!selected)}
                />
              </Grid>
              <Grid item>
                <TickBox
                  disabled={currentObservation === 0}
                  label="Unlinked"
                  testId="unlinkedTickBox"
                  checked={notSelected}
                  onChange={() => setNotSelected(!notSelected)}
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
