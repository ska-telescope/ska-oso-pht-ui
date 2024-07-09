import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid'; // TODO : Need to move this into the ska-gui-components
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, DataGrid, TickBox } from '@ska-telescope/ska-gui-components';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import SensCalcDisplaySingle from '../../components/sensCalcDisplay/single/SensCalcDisplaySingle';
import SensCalcDisplayMultiple from '../../components/sensCalcDisplay/multiple/SensCalcDisplayMultiple';
import getSensCalc from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import Observation from '../../utils/types/observation';
import { Proposal } from '../../utils/types/proposal';
import { validateObservationPage } from '../../utils/proposalValidation';
import { PATH } from '../../utils/constants';
import { SENSCALC_LOADING } from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';
import GroupObservation from '../../utils/types/groupObservation';
import Target from '../../utils/types/target';
import TargetObservation from '../../utils/types/targetObservation';

const DATA_GRID_TARGET = 390;
const DATA_GRID_OBSERVATION = 450;
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
  const [elementsS, setElementsS] = React.useState(null);
  const [elementsT, setElementsT] = React.useState(null);

  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

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

  const setTargetObservationStorage = (targetObservations: TargetObservation[]) => {
    setProposal({ ...getProposal(), targetObservation: targetObservations });
  };

  const addTargetObservationStorage = (rec: TargetObservation) => {
    setTargetObservationStorage([...getProposal().targetObservation, rec]);
  };

  const updateTargetObservationStorage = (target: Target, observationId: string, results: any) => {
    const temp = [
      {
        targetId: target.id,
        observationId: observationId,
        sensCalc: results
      }
    ];
    getProposal().targetObservation.forEach(rec => {
      if (
        (rec: TargetObservation) =>
          rec.targetId !== target.id || rec.observationId !== observationId
      ) {
        temp.push(rec);
      }
    });
    setTargetObservationStorage(temp);
  };

  const popElementO = (rec: Observation) => {
    return {
      id: rec.id,
      id2: rec.id, // Only here to satisfy syntax of DataGrid headers
      rec: rec,
      telescope: rec.telescope,
      subarray: rec.subarray,
      type: rec.type,
      status: 0
    };
  };

  // This type is required for the DataGrid showing the Targets
  type ElementT = {
    id: number;
    name: string;
    ra: string;
    dec: string;
    target: Target;
  };

  const popElementT = (rec: Target) => {
    return {
      id: rec.id,
      name: rec.name,
      ra: rec.ra,
      dec: rec.dec,
      target: rec
    };
  };

  const getSensCalcData = async (target: Target) => {
    const observationId = currObs.id;
    const response = await getSensCalc(currObs, target);
    if (response) {
      setSensCalc(response, target, observationId);
    }
  };

  const setSensCalcForTargetGrid = (target: Target, sensCalc: any) => {
    const tmpTO = [{ targetId: target.id, observationId: currObs.id, sensCalc: sensCalc }];
    elementsS.forEach(rec => {
      if (rec => rec.targetId !== target.id || rec.observationId !== currObs.id) {
        tmpTO.push(rec);
      }
    });
    setElementsS(tmpTO);
    if (sensCalc === SENSCALC_LOADING) {
      getSensCalcData(target);
    }
  };

  const setSensCalc = (results: any, target: Target, observationId: string) => {
    setSensCalcForTargetGrid(target, results);
    updateTargetObservationStorage(target, observationId, results);
  };

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

  const AddObservationTarget = (target: Target) => {
    const rec: TargetObservation = {
      observationId: currObs.id,
      targetId: target.id,
      sensCalc: SENSCALC_LOADING
    };
    addTargetObservationStorage(rec);
    setSensCalcForTargetGrid(target, SENSCALC_LOADING);
  };

  function filterRecords(id: number) {
    return getProposal().targetObservation.filter(
      item => !(item.observationId === currObs.id && item.targetId === id)
    );
  }

  const DeleteObservationTarget = (row: any) => {
    setTargetObservationStorage(filterRecords(row.id));
  };

  const isTargetSelected = (targetId: number) =>
    getProposal().targetObservation.filter(
      entry => entry.observationId === currObs?.id && entry.targetId === targetId
    ).length > 0;

  const targetSelectedToggle = (el: ElementT) => {
    if (isTargetSelected(el.id)) {
      DeleteObservationTarget(el.target);
    } else {
      AddObservationTarget(el.target);
    }
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    setElementsO(getProposal().observations.map(rec => popElementO(rec)));
    setElementsS(getProposal().targetObservation);
    setElementsT(getProposal().targets.map(rec => popElementT(rec)));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateObservationPage(getProposal()));
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

  const getSensCalcForTargetGrid = (targetId: number) => {
    const results = elementsS.find(p => p.observationId === currObs?.id && p.targetId === targetId);
    return results?.sensCalc;
  };

  const extendedColumnsObservations = [
    ...[
      {
        field: 'id',
        headerName: t('observations.id'),
        flex: 0.75,
        disableClickEventBubbling: true
      },
      {
        field: 'id2',
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
            return t(`subArrayConfiguration.${e.row.subarray}`);
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
        renderCell: (e: { row: ElementT }) => {
          return currObs ? (
            <Box pr={1}>
              <TickBox
                label=""
                testId="linkedTickBox"
                checked={isTargetSelected(e.row.target.id)}
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
          return (
            <SensCalcDisplaySingle
              sensCalc={getSensCalcForTargetGrid(e.row.id)}
              show={isTargetSelected(e.row.id)}
            />
          );
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

  const filteredByObservation = (obId: string) => {
    const results = [];
    elementsS.forEach(rec => {
      if (rec.observationId === obId) {
        results.push(rec.sensCalc);
      }
    });
    return results;
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
                height={DATA_GRID_OBSERVATION}
                onRowClick={e => setCurrObs(e.row.rec)}
                onRowSelectionModelChange={newRowSelectionModel => {
                  setRowSelectionModel(newRowSelectionModel);
                }}
                rowSelectionModel={rowSelectionModel}
                testId="observationDetails"
              />
            )}
            {!hasObservations() && (
              <Alert
                color={AlertColorTypes.Error}
                text={t('error.noObservations')}
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
                  height={DATA_GRID_TARGET}
                  testId="linkedTargetDetails"
                />
              )}
              {!hasTargets() && (
                <Alert
                  color={AlertColorTypes.Error}
                  text={t('targets.empty')}
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
