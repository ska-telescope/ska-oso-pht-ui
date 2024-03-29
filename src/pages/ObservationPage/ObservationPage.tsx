import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, InfoCard, InfoCardColorTypes, TickBox } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import AddObservationButton from '../../components/button/AddObservation/AddObservationButton';
import { Proposal } from '../../services/types/proposal';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import SensCalcDisplay from '../../components/sensCalcDisplay/SensCalcDisplay';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';

const PAGE = 5;

export default function ObservationPage() {
  const { t } = useTranslation('pht');

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentObservation, setCurrentObservation] = React.useState(0);
  const [selected, setSelected] = React.useState(true);
  const [notSelected, setNotSelected] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  const deleteIconClicked = () => {
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().observations.filter(e => e.id !== currentObservation);
    const obs2 = getProposal().targetObservation.filter(
      e => e.observationId !== currentObservation
    );
    setProposal({ ...getProposal(), observations: obs1, targetObservation: obs2 });
    setCurrentObservation(0);
    closeDeleteDialog();
  };

  const alertContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal().observations.find(p => p.id === currentObservation);
    return (
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <FieldWrapper label={t('arrayConfiguration.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('arrayConfiguration.' + rec.telescope)}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('subArrayConfiguration.short')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('subArrayConfiguration.' + rec.subarray)}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('observationType.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('observationType.' + rec.type)}</Typography>
        </FieldWrapper>

        <Grid pt={3} container direction="row" alignItems="center" justifyContent="space-around">
          <Grid item>
            <Typography variant="caption">{t('deleteObservation.content1')}</Typography>
          </Grid>
        </Grid>
      </Grid>
    );
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

  const getRows = () => getProposal().observations;

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = getRows().length > 0 ? 1 : 0;
    count += getProposal().targetObservation.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const columns = [
    {
      field: 'telescope',
      headerName: t('arrayConfiguration.label'),
      flex: 0.5,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number } }) => (
        <Typography>{t(`arrayConfiguration.${e.row.telescope}`)}</Typography>
      )
    },
    {
      field: 'subarray',
      headerName: t('subArrayConfiguration.short'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number; subarray: number } }) => {
        if (e.row.telescope) {
          return (
            <Typography>
              {t(`dropdown.telescope.${e.row.telescope}.array.${e.row.subarray}`)}
            </Typography>
          );
        }
        return <Typography>{t('arrayConfiguration.0')}</Typography>;
      }
    },
    {
      field: 'type',
      headerName: t('type.label'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { type: number } }) => (
        <Typography>{t(`observationType.${e.row.type}`)}</Typography>
      )
    },
    {
      field: 'id',
      headerName: t('actions.label'),
      sortable: false,
      flex: 0.5,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => (
        <TrashIcon onClick={deleteIconClicked} toolTip="Delete observation" />
      )
    }
  ];
  const extendedColumnsObservations = [...columns];

  const columnsTargets = [
    { field: 'name', headerName: t('name.label'), width: 200 },
    { field: 'ra', headerName: t('rightAscension.label'), width: 150 },
    { field: 'dec', headerName: t('declination.label'), width: 150 }
  ];
  const columnsTargetsSelected = [
    { field: 'name', headerName: t('name.label'), width: 200 },
    { field: 'ra', headerName: t('rightAscension.label'), width: 150 },
    { field: 'dec', headerName: t('declination.label'), width: 150 },
    {
      field: 'id',
      headerName: t('selected.label'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => {
        const isSelected = isTargetSelected(e.row.id);

        if (currentObservation > 0) {
          return (
            <TickBox
              label=""
              testId="linkedTickBox"
              checked={isSelected}
              onChange={() => targetSelectedToggle(e.row.id)}
            />
          );
        }
        return '';
      }
    },
    {
      field: 'vel',
      headerName: '',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => {
        const isSelected = isTargetSelected(e.row.id);

        if (currentObservation > 0) {
          return (
            <SensCalcDisplay
              observation={getProposal().observations.find(p => p.id === currentObservation)}
              selected={isSelected}
            />
          );
        }
        return '';
      }
    }
  ];
  const extendedColumnsTargets = [...columnsTargets];
  const extendedColumnsTargetsSelected = [...columnsTargetsSelected];

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
            <Grid container direction="row" alignItems="flex-start" justifyContent="space-between">
              <Grid item pb={1}>
                <AddObservationButton />
              </Grid>
            </Grid>
            {getRows().length > 0 && (
              <DataGrid
                rows={getRows()}
                columns={extendedColumnsObservations}
                height={450}
                onRowClick={ClickObservationRow}
                showBorder={false}
                showMild
                testId="observationDetails"
              />
            )}
            {getRows().length === 0 && (
              <InfoCard
                color={InfoCardColorTypes.Error}
                fontSize={20}
                message={t('error.noObservations')}
                testId="helpPanelId"
              />
            )}
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <Grid pt={2} container alignItems="space-evenly" justifyContent="space-around">
              <Grid item>
                <Typography pt={1} variant="h6">
                  {t('targetObservation.label')}
                </Typography>
              </Grid>
              <Grid item>
                <TickBox
                  disabled={currentObservation === 0}
                  label={t('selected.label')}
                  testId="selectedTickBox"
                  checked={selected}
                  onChange={() => setSelected(!selected)}
                />
              </Grid>
              <Grid item>
                <TickBox
                  disabled={currentObservation === 0}
                  label={t('notSelected.label')}
                  testId="unlinkedTickBox"
                  checked={notSelected}
                  onChange={() => setNotSelected(!notSelected)}
                />
              </Grid>
            </Grid>
            <CardContent>
              {getProposal().targets.length > 0 && (
                <DataGrid
                  rows={filteredTargets()}
                  columns={
                    currentObservation > 0 ? extendedColumnsTargetsSelected : extendedColumnsTargets
                  }
                  height={390}
                  showBorder={false}
                  showMild
                  testId="linkedTargetDetails"
                />
              )}
              {getProposal().targets.length === 0 && (
                <InfoCard
                  color={InfoCardColorTypes.Error}
                  fontSize={20}
                  message={t('targets.empty')}
                  testId="helpPanelId"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {openDialog && (
        <AlertDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteObservation.label"
        >
          {alertContent()}
        </AlertDialog>
      )}
    </Shell>
  );
}
