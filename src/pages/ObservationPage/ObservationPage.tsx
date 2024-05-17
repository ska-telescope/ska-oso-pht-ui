import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DataGrid, InfoCard, InfoCardColorTypes, TickBox } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import { STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '../../utils/constants';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import SensCalcDisplaySingle from '../../components/sensCalcDisplay/single/SensCalcDisplaySingle';
import SensCalcDisplayMultiple from '../../components/sensCalcDisplay/multiple/SensCalcDisplayMultiple';
import getSensCalc from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import Observation from '../../utils/types/observation';
import { Proposal } from '../../utils/types/proposal';
import { PATH } from '../../utils/constants';
import { SENSCALC_LOADING } from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import GroupObservation from '../../utils/types/groupObservation';
import Target from '../../utils/types/target';

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
  const [row, setRow] = React.useState(null);

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

  const setSensPending = (id: string) => {
    const temp = [];
    elementsT.forEach(rec => {
      if (rec?.id === id) {
        temp.push({
          id: rec.id,
          observationId: currObs.id,
          name: rec.name,
          ra: rec.ra,
          dec: rec.dec,
          rec: rec,
          sensCalc: SENSCALC_LOADING
        });
        setRow(rec);
      } else {
        temp.push(rec);
      }
    });
    setElementsT(temp);
  };

  const setSensCalc = (results: any, target: any, currId: string) => {
    const temp = [];
    elementsT.forEach(rec => {
      if (rec?.id === target?.id) {
        temp.push({
          id: rec.id,
          observationId: currId,
          name: rec.name,
          ra: rec.ra,
          dec: rec.dec,
          rec: rec,
          sensCalc: results
        });
      } else {
        temp.push(rec);
      }
    });
    setElementsT(temp);

    const temp2 = [];
    getProposal().targetObservation.forEach(rec => {
      if (rec => rec.targetId === target?.id && rec.observationId === currId) {
        temp2.push({
          targetId: rec.targetId,
          observationId: currId,
          sensCalc: results
        });
      } else {
        temp2.push(rec);
      }
    });
    setProposal({ ...getProposal(), targetObservation: temp2 });
  };

  React.useEffect(() => {
    const getSensCalcData = async (ob: Observation, target: Target) => {
      const response = await getSensCalc(ob, target);
      if (response) {
        setSensCalc(response, row.rec, currObs.id);
      }
    };

    if (row) {
      getSensCalcData(currObs, row.rec);
      setRow(null);
    }
  }, [row]);

  const editIconClicked = (row: any) => {
    setCurrObs(row.rec);
    // TODO : Need to complete this
    // navigate(PATH[4], currObs);
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
    const obs3 = getProposal().groupObservations.filter(e => e.observationId !== currObs.id);
    setProposal({
      ...getProposal(),
      observations: obs1,
      targetObservation: obs2,
      groupObservations: obs3
    });

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
            {t('dropdown.telescope.' + rec.telescope + '.array.' + rec.subarray)}
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

  const AddObservationTarget = (row: any) => {
    const rec = {
      observationId: currObs.id,
      targetId: row.rec.id,
      sensCalc: SENSCALC_LOADING
    };
    setProposal({
      ...getProposal(),
      targetObservation: [...getProposal().targetObservation, rec]
    });
    setSensPending(row.rec.id);
  };

  function filterRecords(id: number) {
    return getProposal().targetObservation.filter(
      item => !(item.observationId === currObs.id && item.targetId === id)
    );
  }

  const DeleteObservationTarget = (row: any) => {
    setProposal({ ...getProposal(), targetObservation: filterRecords(row.id) });
  };

  const isTargetSelected = (id: number) =>
    getProposal().targetObservation.filter(
      entry => entry.observationId === currObs?.id && entry.targetId === id
    ).length > 0;

  const targetSelectedToggle = (row: any) => {
    if (isTargetSelected(row.id)) {
      DeleteObservationTarget(row);
    } else {
      AddObservationTarget(row);
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
        sensCalc: null
      }))
    );
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

  const observationGroupIds = (id: string) => {
    if (
      getProposal()?.groupObservations &&
      getProposal()?.groupObservations.some(e => e.observationId === id)
    ) {
      const group: GroupObservation[] = getProposal().groupObservations.filter(
        e => e.observationId === id
      );
      return group[0]?.groupId;
    }
    return '';
  };

  const hasTargets = () => elementsT?.length > 0;

  const hasObservations = () => elementsO?.length > 0;

  const hasTargetObservations = () =>
    getProposal() && getProposal().targetObservation && getProposal().targetObservation.length > 0;

  const extendedColumnsObservations = [
    ...[
      {
        field: 'id',
        headerName: t('observations.id'),
        flex: 0.75,
        disableClickEventBubbling: true
      },
      {
        headerName: t('observations.group'),
        flex: 0.75,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: number } }) => {
          return observationGroupIds((e.row.id as unknown) as string);
        }
      },
      {
        field: 'telescope',
        headerName: t('arrayConfiguration.short'),
        flex: 0.5,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { telescope: number } }) =>
          t(`arrayConfiguration.${e.row.telescope}`)
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
            <SensCalcDisplayMultiple observation={obs} elementsT={filteredByObservation(obs.id)} />
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
                onClick={() => editIconClicked(e.row)}
                disabled={true}
                toolTip={t('observations.edit')}
              />
              <TrashIcon
                onClick={() => deleteIconClicked(e.row)}
                toolTip={t('observations.delete')}
              />
            </>
          );
        }
      }
    ]
  ];

  const extendedColumnsTargets = [
    ...[
      {
        field: 'id',
        headerName: '',
        sortable: false,
        flex: 0.6,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: number } }) => {
          return currObs ? (
            <Box pr={1}>
              <TickBox
                label=""
                testId="linkedTickBox"
                checked={isTargetSelected(e.row.id)}
                onChange={() => targetSelectedToggle(e.row)}
              />
            </Box>
          ) : (
            <></>
          );
        }
      },
      { field: 'name', headerName: t('name.label'), flex: 1.5 },
      { field: 'ra', headerName: t('rightAscension.label'), flex: 1.5 },
      { field: 'dec', headerName: t('declination.label'), flex: 1.5 },
      {
        field: 'vel',
        renderHeader: () =>
          currObs ? (
            <Grid container direction="row" justifyContent="space-between" alignItems="right">
              <Grid ml={10}>{t('sensitivityCalculatorResults.totalSensitivity')}</Grid>
              <Grid ml={15}>{t('sensitivityCalculatorResults.beamSize')}</Grid>
            </Grid>
          ) : (
            <></>
          ),
        sortable: false,
        flex: 5,
        disableClickEventBubbling: true,
        renderCell: (e: { row: any }) => {
          return <SensCalcDisplaySingle row={e.row} show={isTargetSelected(e.row.id)} />;
        }
      }
    ]
  ];

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

  const filteredByObservation = obId => {
    return elementsT.filter(e => e.observationId === obId).map(e => e.sensCalc);
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
                <AddButton title="addObservation.button" action={PATH[2]} />
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
              <Grid item xs={1}></Grid>
              <Grid item xs={2}>
                <TickBox
                  disabled={!currObs}
                  label={t('selected.label')}
                  testId="selectedTickBox"
                  checked={selected}
                  onChange={() => setSelected(!selected)}
                />
              </Grid>
              <Grid item xs={3}>
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
