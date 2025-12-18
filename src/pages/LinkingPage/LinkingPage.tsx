import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, DataGrid, TickBox } from '@ska-telescope/ska-gui-components';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import SensCalcDisplaySingle from '../../components/alerts/sensCalcDisplay/single/SensCalcDisplaySingle';
import Observation from '../../utils/types/observation';
import { validateCalibrationPage, validateLinkingPage } from '../../utils/validation/validation';
import {
  IW_NATURAL,
  OB_SUBARRAY_CUSTOM,
  PAGE_CALIBRATION,
  PAGE_LINKING,
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
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';
import { generateId } from '@/utils/helpers';
import { calculateSensCalcData } from '@/utils/sensCalc/sensCalc';
import { DataProductSDP } from '@/utils/types/dataProduct';

export default function LinkingPage() {
  const DATA_GRID_TARGET = '40vh';
  const DATA_GRID_OBSERVATION = '50vh';
  const PAGE = PAGE_LINKING;

  const { t } = useScopedTranslation();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currObs, setCurrObs] = React.useState<Observation | null>(null);
  const [currDataProductSDP] = React.useState<DataProductSDP | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [openMultipleDialog, setOpenMultipleDialog] = React.useState(false);
  const [elementsO, setElementsO] = React.useState<ReturnType<typeof popElementO>[]>([]);
  const [elementsT, setElementsT] = React.useState<ElementT[] | null>(null);
  const [checkState, setCheckState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>(
    'indeterminate'
  );
  const loggedIn = isLoggedIn();

  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const { notifyError } = useNotify();

  const NOTIFICATION_DELAY_IN_SECONDS = 5;

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number, valueCalibration: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      // validate linking page & calibration page
      temp.push(
        PAGE === i ? value : PAGE_CALIBRATION === i ? valueCalibration : getProposalState()[i]
      );
    }
    updateAppContent1(temp);
  };

  const isIntegrationTime = (ob: { supplied: { type: number } }) =>
    ob?.supplied?.type === SUPPLIED_TYPE_INTEGRATION;

  const getLevel = (obs: any) => {
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
      if (typeof rec !== 'undefined' && rec.statusGUI === STATUS_ERROR) {
        result = rec.error ?? '';
      }
    });
    return result;
  };

  const setTargetObservationAndCalibrationStorage = (
    targetObservations: TargetObservation[],
    calibration: CalibrationStrategy[] | []
  ) => {
    setProposal({
      ...getProposal(),
      targetObservation: targetObservations,
      calibrationStrategy: [...calibration]
    });
  };

  const addTargetObservationAndCalibrationStorage = (
    targetObs: TargetObservation,
    calibration: CalibrationStrategy
  ) => {
    setTargetObservationAndCalibrationStorage(
      [...(getProposal().targetObservation ?? []), targetObs],
      [calibration]
    );
  };

  const updateTargetObservationStorage = (
    target: Target,
    observationId: string,
    dataProductsSDPId: string,
    results: any
  ) => {
    const temp = {
      observationId: observationId,
      dataProductsSDPId: dataProductsSDPId,
      targetId: target.id,
      sensCalc: results
    };
    const base = getProposal().targetObservation?.filter(
      e => !(e.targetId === target.id && e.observationId === observationId)
    );
    base?.push(temp);
    const existingCalibration = getProposal().calibrationStrategy?.find(
      cal => cal.observationIdRef === observationId
    );
    setTargetObservationAndCalibrationStorage(
      base ?? [],
      existingCalibration ? [existingCalibration] : []
    );
  };

  const deleteObservationTargetAndCalibration = (row: any) => {
    function filterRecords(id: number) {
      return getProposal().targetObservation?.filter(
        item => !(item.observationId === currObs?.id && item.targetId === id)
      );
    }
    function filterRecordsCalibration(id: number) {
      return getProposal().calibrationStrategy?.filter(
        item => item.observationIdRef === id.toString()
      );
    }
    setTargetObservationAndCalibrationStorage(
      filterRecords(row.id) ?? [],
      filterRecordsCalibration(row.id) ?? []
    );
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
      raStr: rec.raStr ?? '',
      decStr: rec.decStr ?? '',
      target: rec
    };
  };

  const getSensCalcData = async (
    observation: Observation,
    target: Target,
    dataProductSDP: DataProductSDP
  ) => {
    const response = await calculateSensCalcData(observation, target, dataProductSDP);
    if (response) {
      if (response.error) {
        const errMsg = response.error;
        notifyError(errMsg, NOTIFICATION_DELAY_IN_SECONDS);
      }
      setSensCalc(response, target, observation.id, dataProductSDP.id);
    }
  };

  const setSensCalc = (
    results: any,
    target: Target,
    observationId: string,
    dataProductsSDPId: string
  ) => {
    updateTargetObservationStorage(target, observationId, dataProductsSDPId, results);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().observations?.filter(e => e.id !== currObs?.id) ?? [];
    const obs2 =
      getProposal().targetObservation?.filter(e => e.observationId !== currObs?.id) ?? [];
    const obs3 =
      getProposal().groupObservations?.filter(e => e.observationId !== currObs?.id) ?? [];
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

  const addObservationTargetAndCalibration = (target: Target) => {
    if (!currObs || !currDataProductSDP) return;
    const targetObs: TargetObservation = {
      observationId: currObs.id,
      targetId: target.id,
      dataProductsSDPId: currDataProductSDP?.id,
      sensCalc: {
        id: target.id,
        title: target.name,
        statusGUI: STATUS_PARTIAL,
        error: ''
      }
    };
    // TODO check if already exists?
    const calibration: CalibrationStrategy = {
      observatoryDefined: true,
      id: generateId('cal-'),
      observationIdRef: currObs?.id,
      calibrators: null,
      notes: null,
      isAddNote: false
    };
    addTargetObservationAndCalibrationStorage(targetObs, calibration);
  };

  const isTargetSelected = (targetId: number) =>
    (getProposal().targetObservation ?? []).filter(
      entry => entry.observationId === currObs?.id && entry.targetId === targetId
    ).length > 0;

  const targetSelectedToggle = (el: ElementT) => {
    if (isTargetSelected(el.id)) {
      deleteObservationTargetAndCalibration(el.target);
    } else {
      addObservationTargetAndCalibration(el.target);
    }
  };

  const checkPartials = () => {
    const results = getProposal()?.targetObservation?.find(
      p => p.sensCalc.statusGUI === STATUS_PARTIAL
    );
    if (results) {
      const target = getProposal().targets?.find(e => e.id === results.targetId);
      const observation = getProposal().observations?.find(e => e.id === results.observationId);
      const dataProductSDP = getProposal().dataProductSDP?.find(
        d => d.id === results.dataProductsSDPId
      ); // TODO double check this is correct when implementing linking page for proposal flow
      if (observation && target && dataProductSDP) {
        getSensCalcData(observation, target, dataProductSDP);
      }
    }
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    setElementsO(getProposal().observations?.map(rec => popElementO(rec)) ?? []);
    setElementsT(getProposal().targets?.map(rec => popElementT(rec)) ?? []);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    checkPartials();
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateLinkingPage(getProposal()), validateCalibrationPage(getProposal()));
  }, [validateToggle]);

  const observationGroupIds = (id: string) => {
    if (
      getProposal()?.groupObservations &&
      getProposal()?.groupObservations?.some(e => e.observationId === id)
    ) {
      const group: GroupObservation[] =
        getProposal().groupObservations?.filter(e => e.observationId === id) ?? [];
      return group[0]?.groupId;
    }
    return '';
  };

  const hasTargets = () => (elementsT?.length ?? 0) > 0;

  const hasObservations = () => elementsO?.length > 0;

  const getSensCalcForTargetGrid = (targetId: number) =>
    getProposal()?.targetObservation?.find(
      p => p.observationId === currObs?.id && p.targetId === targetId
    )?.sensCalc;

  const isCustom = () => currObs?.subarray === OB_SUBARRAY_CUSTOM;
  const isNatural = () =>
    currObs?.subarray !== OB_SUBARRAY_CUSTOM && currDataProductSDP?.weighting === IW_NATURAL;

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
          t('observingBand.short.' + e.row.rec.observingBand)
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
    const results: SensCalcResults[] = [];
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
            {hasObservations() && (
              <DataGrid
                rows={elementsO}
                columns={extendedColumnsObservations}
                height={DATA_GRID_OBSERVATION}
                onRowClick={(e: { row: { rec: React.SetStateAction<Observation | null> } }) =>
                  setCurrObs(e.row.rec)
                }
                onRowSelectionModelChange={(
                  newRowSelectionModel: React.SetStateAction<GridRowSelectionModel>
                ) => {
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
      <>
        {openDeleteDialog && currObs && (
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
      </>
    </Shell>
  );
}
