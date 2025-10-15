import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid'; // TODO : Need to move this into the ska-gui-components
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, DataGrid, TickBox } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import SensCalcDisplaySingle from '../../components/alerts/sensCalcDisplay/single/SensCalcDisplaySingle';
import getSensCalc from '../../services/api/sensitivityCalculator/getSensitivityCalculatorAPIData';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Observation from '../../utils/types/observation';
import { Proposal } from '../../utils/types/proposal';
import { validateObservationPage } from '../../utils/validation/validation';
import {
  BANDWIDTH_TELESCOPE,
  IW_NATURAL,
  OB_SUBARRAY_CUSTOM,
  PATH,
  RA_TYPE_ICRS,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_OK,
  STATUS_PARTIAL,
  SUPPLIED_TYPE_INTEGRATION
} from '../../utils/constants';
import GroupObservation from '../../utils/types/groupObservation';
import Target from '../../utils/types/target';
import TargetObservation from '../../utils/types/targetObservation';
import DeleteObservationConfirmation from '../../components/alerts/deleteObservationConfirmation/deleteObservationConfirmation';
import SensCalcModalMultiple from '../../components/alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import StatusIconDisplay from '../../components/icon/status/statusIcon';
import { FOOTER_SPACER } from '../../utils/constants';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const DATA_GRID_TARGET = '40vh';
const DATA_GRID_OBSERVATION = '50vh';
const PAGE = 5;

export default function ObservationPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currObs, setCurrObs] = React.useState<Observation | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openMultipleDialog, setOpenMultipleDialog] = React.useState(false);
  const [elementsO, setElementsO] = React.useState(null);
  const [elementsT, setElementsT] = React.useState<ElementT[] | null>(null);
  const [checkState, setCheckState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>(
    'indeterminate'
  );
  const loggedIn = isLoggedIn();

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

  const isIntegrationTime = (ob: { supplied: { type: number } }) =>
    ob?.supplied?.type === SUPPLIED_TYPE_INTEGRATION;

  const getLevel = (obs: Observation) => {
    let result = STATUS_INITIAL;
    filteredByObservation(obs.id)?.forEach(rec => {
      if (typeof rec !== 'undefined') {
        switch (rec.statusGUI) {
          case STATUS_ERROR:
            result = STATUS_ERROR;
            return;
          case STATUS_PARTIAL:
            result = result !== STATUS_ERROR ? STATUS_PARTIAL : STATUS_ERROR;
            return;
          default:
            if (result !== STATUS_PARTIAL && result !== STATUS_ERROR) {
              result = STATUS_OK;
            }
        }
      }
    });
    return result;
  };

  const getError = (obs: Observation) => {
    let result = '';
    filteredByObservation(obs.id)?.forEach(rec => {
      if (typeof rec !== 'undefined' && rec.status === STATUS_ERROR) {
        result = rec.error;
      }
    });
    return result;
  };

  const setTargetObservationStorage = (targetObservations: TargetObservation[]) => {
    setProposal({ ...getProposal(), targetObservation: targetObservations });
  };

  const addTargetObservationStorage = (rec: TargetObservation) => {
    setTargetObservationStorage([...(getProposal().targetObservation ?? []), rec]);
  };

  const updateTargetObservationStorage = (target: Target, observationId: string, results: any) => {
    const temp = {
      observationId: observationId,
      targetId: target.id,
      sensCalc: results
    };
    const base = getProposal().targetObservation?.filter(
      e => !(e.targetId === target.id && e.observationId === observationId)
    );
    base?.push(temp);
    setTargetObservationStorage(base);
  };

  const deleteObservationTarget = (row: any) => {
    function filterRecords(id: number) {
      return getProposal().targetObservation?.filter(
        item => !(item.observationId === currObs?.id && item.targetId === id)
      );
    }
    setTargetObservationStorage(filterRecords(row.id));
  };

  const popElementO = (rec: Observation) => {
    return {
      id: rec.id,
      id2: rec.id /* Only here to satisfy syntax of DataGrid headers */,
      rec: rec,
      telescope: rec.telescope,
      subarray: rec.subarray,
      type: rec.type,
      status: 0
    };
  };

  /* This type is required for the DataGrid showing the Targets */
  type ElementT = {
    id: number;
    name: string;
    raStr: string;
    decStr: string;
    target: Target;
  };

  const popElementT = (rec: Target) => {
    return {
      id: rec.id,
      name: rec.name,
      raStr: rec.raStr,
      decStr: rec.decStr,
      target: rec
    };
  };

  const getSensCalcData = async (observation: Observation, target: Target) => {
    const response = await getSensCalc(observation, target);
    if (response) {
      setSensCalc(response, target, observation.id);
    }
  };

  const setSensCalc = (results: any, target: Target, observationId: string) => {
    updateTargetObservationStorage(target, observationId, results);
  };

  const editIconClicked = (row: any) => {
    setCurrObs(row.rec);
    navigate(PATH[2], { replace: true, state: row.rec });
  };

  const deleteIconClicked = (row: any) => {
    setCurrObs(row.rec);
    setOpenDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().observations.filter(e => e.id !== currObs?.id);
    const obs2 = getProposal().targetObservation.filter(e => e.observationId !== currObs?.id);
    const obs3 = getProposal().groupObservations.filter(e => e.observationId !== currObs?.id);
    setProposal({
      ...getProposal(),
      observations: obs1,
      targetObservation: obs2,
      groupObservations: obs3
    });
    setElementsO(elementsO.filter(e => e.id !== currObs?.id));
    setCurrObs(null);
    closeDeleteDialog();
  };

  const addObservationTarget = (target: Target) => {
    const rec: TargetObservation = {
      observationId: currObs.id,
      targetId: target.id,
      sensCalc: {
        id: target.id,
        title: target.name,
        statusGUI: STATUS_PARTIAL,
        error: ''
      }
    };
    addTargetObservationStorage(rec);
  };

  const isTargetSelected = (targetId: number) =>
    getProposal().targetObservation.filter(
      entry => entry.observationId === currObs?.id && entry.targetId === targetId
    ).length > 0;

  const targetSelectedToggle = (el: ElementT) => {
    if (isTargetSelected(el.id)) {
      deleteObservationTarget(el.target);
    } else {
      addObservationTarget(el.target);
    }
  };

  const checkPartials = () => {
    const results = getProposal()?.targetObservation?.find(
      p => p.sensCalc.statusGUI === STATUS_PARTIAL
    );
    if (results) {
      const target = getProposal().targets.find(e => e.id === results.targetId);
      const observation = getProposal().observations.find(e => e.id === results.observationId);
      getSensCalcData(observation, target);
    }
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    setElementsO(getProposal().observations?.map(rec => popElementO(rec)));
    setElementsT(getProposal().targets?.map(rec => popElementT(rec)));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    checkPartials();
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

  const getSensCalcForTargetGrid = (targetId: number) =>
    getProposal()?.targetObservation?.find(
      p => p.observationId === currObs?.id && p.targetId === targetId
    )?.sensCalc;

  const isCustom = () => currObs?.subarray === OB_SUBARRAY_CUSTOM;
  const isNatural = () =>
    currObs?.subarray !== OB_SUBARRAY_CUSTOM && currObs?.imageWeighting === IW_NATURAL;

  const getSensCalcSingle = (id: number, field: string) => (
    <SensCalcDisplaySingle
      sensCalc={getSensCalcForTargetGrid(id)}
      show={isTargetSelected(id)}
      field={field}
      isCustom={isCustom()}
      isNatural={isNatural()}
    />
  );

  const extendedColumnsObservations = [
    ...[
      {
        field: 'id',
        headerName: t('observations.id'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true
      },
      {
        field: 'id2',
        headerName: t('observations.group'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: number } }) => {
          return observationGroupIds((e.row.id as unknown) as string);
        }
      },
      {
        field: 'telescope',
        headerName: t('observingBand.label'),
        flex: 1.5,
        minWidth: 250,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { rec: { observingBand: string | number } } }) =>
          BANDWIDTH_TELESCOPE[e.row.rec.observingBand]?.label
      },
      {
        field: 'subarray',
        headerName: t('subArrayConfiguration.short'),
        flex: 1,
        minWidth: 150,
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
        width: 140,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { type: number } }) => t(`observationType.${e.row.type}`)
      },
      {
        field: 'weather',
        headerName: 'Status',
        sortable: false,
        width: 100,
        disableClickEventBubbling: true,
        renderCell: (e: { row: Observation }) => {
          const obs = elementsO.find(p => p.id === e.row.id);
          return (
            <>
              {
                <StatusIconDisplay
                  ariaDescription=" "
                  ariaTitle={t('sensCalc.' + getLevel(obs))}
                  level={getLevel(obs)}
                  onClick={() =>
                    getLevel(obs) === STATUS_INITIAL ? null : setOpenMultipleDialog(true)
                  }
                  testId="testId"
                  toolTip={t('sensCalc.' + getLevel(obs))}
                />
              }
            </>
          );
        }
      },
      {
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        sortable: false,
        width: 100,
        disableClickEventBubbling: true,
        renderCell: (e: { row: Observation }) => {
          return (
            <>
              <EditIcon onClick={() => editIconClicked(e.row)} toolTip={t('observations.edit')} />
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
        renderHeader: () => (
          <Box
            pl={2}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              margin: 0
            }}
          >
            {currObs ? <TriStateCheckbox state={checkState} setState={setCheckState} /> : <></>}
          </Box>
        ),
        disableClickEventBubbling: true,
        filterable: false,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (e: { row: ElementT }) => {
          return currObs ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                margin: 0
              }}
            >
              <TickBox
                label=""
                labelPosition="top"
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
      { field: 'name', headerName: t('name.label'), flex: 1.5, minWidth: 120 },
      { field: 'raStr', headerName: t('skyDirection.short.1.' + RA_TYPE_ICRS.value), width: 120 },
      { field: 'decStr', headerName: t('skyDirection.short.2.' + RA_TYPE_ICRS.value), width: 120 },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Status',
        sortable: false,
        width: 100,
        disableClickEventBubbling: true,
        renderCell: (e: { row: any }) => {
          return getSensCalcSingle(e.row.id, 'icon');
        }
      },
      {
        field: 'vel',
        renderHeader: () =>
          currObs ? (
            <>
              {t(
                isIntegrationTime(currObs)
                  ? 'sensitivityCalculatorResults.weightedSensitivity'
                  : 'sensitivityCalculatorResults.integrationTime'
              )}
            </>
          ) : (
            <></>
          ),
        sortable: false,
        flex: 2,
        minWidth: 170,
        disableClickEventBubbling: true,
        renderCell: (e: { row: any }) => {
          return getSensCalcSingle(
            e.row.id,
            isIntegrationTime(currObs as Observation) ? 'SensitivityWeighted' : 'IntegrationTime'
          );
        }
      },
      {
        field: 'vel2',
        renderHeader: () => (currObs ? <>{t('sensitivityCalculatorResults.beamSize')}</> : <></>),
        sortable: false,
        flex: 2.5,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: any }) => {
          return getSensCalcSingle(e.row.id, 'SynthBeamSize');
        }
      }
    ]
  ];

  const filteredTargets = () => {
    const safeElementsT = elementsT ?? [];
    if (checkState === 'indeterminate') return safeElementsT;
    else if (checkState === 'checked') return safeElementsT.filter(e => isTargetSelected(e.id));
    else if (checkState === 'unchecked') return safeElementsT.filter(e => !isTargetSelected(e.id));
    else return [];
  };

  const filteredByObservation = (obId: string) => {
    const results = [];
    getProposal()?.targetObservation?.forEach(rec => {
      if (rec.observationId === obId) {
        results.push(rec.sensCalc);
      }
    });
    return results;
  };

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ md: 11, lg: 5 }}>
          <Grid container direction="column" alignItems="flex-start" justifyContent="space-around">
            <Grid container direction="row" alignItems="flex-start" justifyContent="space-between">
              <Grid pb={1}>
                <AddButton
                  action={PATH[2]}
                  primary={!hasObservations()}
                  testId="addObservationButton"
                  title="addObservation.button"
                />
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
                text={loggedIn ? t('error.noObservations') : t('error.noObservationsLoggedOut')}
                testId="noObservationsNotification"
              />
            )}
          </Grid>
        </Grid>
        <Grid size={{ md: 11, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Grid container alignItems="baseline" justifyContent="space-between">
                <Grid>
                  <Typography id="targetObservationLabel" variant="h6">
                    {t('targetObservation.label')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
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
                  text={loggedIn ? t('targets.empty') : t('targets.loggedOut')}
                  testId="noTargetsNotification"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {openDeleteDialog && (
        <DeleteObservationConfirmation
          action={deleteConfirmed}
          observation={currObs}
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
        />
      )}
      {openMultipleDialog && currObs && (
        <SensCalcModalMultiple
          open={openMultipleDialog}
          onClose={() => setOpenMultipleDialog(false)}
          data={filteredByObservation(currObs?.id)}
          observation={currObs}
          level={getLevel(currObs)}
          levelError={getError(currObs)}
          isCustom={isCustom()}
          isNatural={isNatural()}
        />
      )}
    </Shell>
  );
}
