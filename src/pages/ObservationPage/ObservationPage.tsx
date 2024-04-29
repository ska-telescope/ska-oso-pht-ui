import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, InfoCard, InfoCardColorTypes, TickBox } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import AddObservationButton from '../../components/button/AddObservation/AddObservationButton';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import SensCalcDisplaySingle from '../../components/sensCalcDisplay/single/SensCalcDisplaySingle';
import SensCalcDisplayMultiple from '../../components/sensCalcDisplay/multiple/SensCalcDisplayMultiple';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import Observation from '../../utils/types/observation';
import { Proposal } from '../../utils/types/proposal';

const PAGE = 5;
const LABEL_WIDTH = 6;

export default function ObservationPage() {
  const { t } = useTranslation('pht');

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currObs, setCurrObs] = React.useState(null);
  const [selected, setSelected] = React.useState(true);
  const [notSelected, setNotSelected] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [elementsO, setElementsO] = React.useState(null);
  const [elementsT, setElementsT] = React.useState(null);

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

  const setLastObs = (currObsId: number, target: any, value: number) => {
    const temp = [];
    elementsT.forEach(rec => {
      if (rec.id === target.id) {
        temp.push({
          id: rec.id,
          name: rec.name,
          ra: rec.ra,
          dec: rec.dec,
          status: value,
          lastObs: currObsId
        });
      } else {
        temp.push(rec);
      }
    });
    setElementsT(temp);
  };

  const editIconClicked = async (id: string) => {
    alert(t('error.iconClicked'));
  };

  const deleteIconClicked = (row: any) => {
    setCurrObs(row.rec);
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = elementsO.filter(e => e.id !== currObs.id);
    const obs2 = getProposal().targetObservation.filter(e => e.observationId !== currObs.id);
    setProposal({ ...getProposal(), observations: obs1, targetObservation: obs2 });

    const temp = [];
    elementsO.forEach(rec => {
      if (rec.id !== currObs.id) {
        temp.push(rec);
      }
    });
    setElementsO(temp);
    setCurrObs(null);
    closeDeleteDialog();
  };

  const alertContent = (rec: any) => {
    return (
      <Grid p={2} container direction="column" alignItems="center" justifyContent="space-around">
        <FieldWrapper label={t('arrayConfiguration.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{t('arrayConfiguration.' + rec.telescope)}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('subArrayConfiguration.short')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {t('dropdown.telescope.' + rec.telescope + '.' + rec.subarray)}
          </Typography>
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
    console.log('TREVOR', currObs);
    const rec = { observationId: currObs?.id, targetId: id, status: 0 };
    setProposal({ ...getProposal(), targetObservation: [...getProposal().targetObservation, rec] });
  };

  function filterRecords(id: number) {
    return getProposal().targetObservation.filter(
      item => !(item.observationId === currObs.id && item.targetId === id)
    );
  }

  const DeleteObservationTarget = (id: number) => {
    setProposal({ ...getProposal(), targetObservation: filterRecords(id) });
  };

  const isTargetSelected = (id: number) =>
    getProposal().targetObservation.filter(
      entry => entry.observationId === currObs?.id && entry.targetId === id
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
    // TODO: Unable to add units at the moment as they are not mapped correctly.
    setElementsT(
      getProposal().targets.map(rec => ({
        id: rec.id,
        rec: rec,
        name: rec.name,
        ra: rec.ra,
        dec: rec.dec,
        status: 0,
        lastObs: null
      }))
    );
    console.log('OBS', getProposal().observations);
    setElementsO(
      getProposal().observations.map(rec => ({
        id: rec.id,
        rec: rec,
        telescope: rec.telescope,
        subarray: rec.subarray,
        type: rec.type,
        status: 0
      }))
    );
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_PARTIAL, STATUS_OK];
    let count = hasObservations() ? 1 : 0;
    count += hasTargetObservations() ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const columns = [
    {
      field: 'id',
      headerName: t('observations.id'),
      flex: 0.75,
      disableClickEventBubbling: true
    },
    {
      field: 'telescope',
      headerName: t('arrayConfiguration.short'),
      flex: 0.5,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number } }) => t(`arrayConfiguration.${e.row.telescope}`)
    },
    {
      field: 'subarray',
      headerName: t('subArrayConfiguration.short'),
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { telescope: number; subarray: number } }) => {
        if (e.row.telescope) {
          return t(`dropdown.telescope.${e.row.telescope}.array.${e.row.subarray}`);
        }
        return t('arrayConfiguration.0');
      }
    },
    {
      field: 'type',
      headerName: t('observationType.short'),
      flex: 0.75,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { type: number } }) => t(`observationType.${e.row.type}`)
    },
    {
      field: 'weather',
      headerName: '',
      sortable: false,
      flex: 0.5,
      disableClickEventBubbling: true,
      renderCell: (e: { row: Observation }) => {
        const obs = elementsO.find(p => p.id === e.row.id);
        return (
          <SensCalcDisplayMultiple observation={obs} targetIds={observationTargetIds(obs.id)} />
        );
      }
    },
    {
      field: 'actions',
      headerName: t('actions.label'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: Observation }) => {
        return (
          <>
            <EditIcon
              onClick={() => editIconClicked(e.row.id)}
              disabled={true}
              toolTip="Currently disabled"
            />
            <TrashIcon onClick={() => deleteIconClicked(e.row)} toolTip="Delete observation" />
          </>
        );
      }
    }
  ];
  const extendedColumnsObservations = [...columns];
  const hasTargets = () => elementsT?.length > 0;

  const hasObservations = () => elementsO?.length > 0;

  const hasTargetObservations = () =>
    getProposal() && getProposal().targetObservation && getProposal().targetObservation.length > 0;

  const columnsTargets = [
    {
      field: 'id',
      headerName: '',
      sortable: false,
      flex: 0.6,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => {
        return currObs?.id !== '' ? (
          <TickBox
            label=""
            testId="linkedTickBox"
            checked={isTargetSelected(e.row.id)}
            onChange={() => targetSelectedToggle(e.row.id)}
          />
        ) : (
          <></>
        );
      }
    },
    { field: 'name', headerName: t('name.label'), flex: 1.5 },
    { field: 'ra', headerName: t('rightAscension.label'), flex: 1.5 },
    { field: 'dec', headerName: t('declination.label'), flex: 1 },
    {
      field: 'vel',
      renderHeader: () =>
        currObs?.id !== '' ? (
          <Grid container direction="row" justifyContent="flex-start" alignItems="center">
            <Grid mr={10}></Grid>
            <Grid mr={10}>
              <Typography>{t('sensitivityCalculatorResults.totalSensitivity')}</Typography>
            </Grid>
            <Grid>
              <Typography>{t('sensitivityCalculatorResults.integrationTime')}</Typography>
            </Grid>
          </Grid>
        ) : (
          <></>
        ),
      sortable: false,
      flex: 5,
      disableClickEventBubbling: true,
      renderCell: (e: { row: any }) => {
        const isSelected = isTargetSelected(e.row.id);

        if (currObs) {
          const obs: Observation =
            currObs.id !== e.row.lastObs ? elementsO.find(p => p.id === currObs.id) : null;
          return (
            <SensCalcDisplaySingle
              observation={obs}
              row={e.row}
              setObs={setLastObs}
              selected={isSelected}
              target={e.row}
            />
          );
        }
        return '';
      }
    }
  ];
  const extendedColumnsTargets = [...columnsTargets];

  const filteredTargets = () => {
    if (selected) {
      if (notSelected) {
        return elementsT;
      }
      return elementsT.filter(e => isTargetSelected(e.id));
    }
    if (notSelected) {
      return elementsT.filter(e => !isTargetSelected(e.id));
    }
    return [];
  };

  const observationTargetIds = (id: string) => {
    return getProposal().targetObservation.filter(e => e.observationId === id);
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
            {hasObservations() && (
              <DataGrid
                rows={elementsO}
                columns={extendedColumnsObservations}
                height={450}
                onRowClick={e => setCurrObs(e.row.rec)}
                testId="observationDetails"
              />
            )}
            {!hasObservations() && (
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
                  disabled={!currObs}
                  label={t('selected.label')}
                  testId="selectedTickBox"
                  checked={selected}
                  onChange={() => setSelected(!selected)}
                />
              </Grid>
              <Grid item>
                <TickBox
                  disabled={!currObs}
                  label={t('notSelected.label')}
                  testId="unlinkedTickBox"
                  checked={notSelected}
                  onChange={() => setNotSelected(!notSelected)}
                />
              </Grid>
            </Grid>
            <CardContent>
              {hasTargets() && (
                <DataGrid
                  rows={filteredTargets()}
                  columns={extendedColumnsTargets}
                  height={390}
                  testId="linkedTargetDetails"
                />
              )}
              {!hasTargets() && (
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
          {alertContent(currObs)}
        </AlertDialog>
      )}
    </Shell>
  );
}
