import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  AlertColorTypes,
  BorderedSection,
  DataGrid,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { getColors, Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import SensCalcDisplaySingle from '../../components/alerts/sensCalcDisplay/single/SensCalcDisplaySingle';
import Observation from '../../utils/types/observation';
import { validateCalibrationPage, validateLinkingPage } from '../../utils/validation/validation';
import {
  IW_NATURAL,
  SA_CUSTOM,
  PAGE_CALIBRATION,
  PAGE_LINKING,
  RA_TYPE_ICRS,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_OK,
  STATUS_PARTIAL,
  SUPPLIED_TYPE_INTEGRATION
} from '../../utils/constants';
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
import { DataProductSDPNew } from '@/utils/types/dataProduct';

export default function LinkingPage() {
  const DATA_GRID_TARGET = '60vh';
  const DATA_GRID_OBSERVATION = '60vh';
  const PAGE = PAGE_LINKING;
  const GAP = 5;

  const { t } = useScopedTranslation();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currObs, setCurrObs] = React.useState<Observation | null>(null);
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

  const popElementO = (dp: DataProductSDPNew, obs: Observation) => {
    return {
      id: dp.id,
      id2: obs.id,
      rec: obs,
      telescope: obs.telescope,
      subarray: obs.subarray,
      type: obs.type,
      dp: dp,
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
    dataProductSDP: DataProductSDPNew
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
    if (!currObs) return;
    const dp = elementsO.find(e => e.id === currObs.id)?.dp;
    const targetObs: TargetObservation = {
      observationId: currObs.id,
      targetId: target.id,
      dataProductsSDPId: dp?.id ?? '',
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
      notes: null
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
    const proposal = getProposal();
    const results = proposal?.targetObservation?.find(p => p.sensCalc.statusGUI === STATUS_PARTIAL);
    if (results) {
      const target = proposal.targets?.find(e => e.id === results.targetId);
      const observation = proposal.observations?.find(e => e.id === results.observationId);
      const dataProductSDP = proposal.dataProductSDP?.find(d => d.id === results.dataProductsSDPId);
      if (observation && target && dataProductSDP) {
        getSensCalcData(observation, target, dataProductSDP);
      }
    }
  };

  React.useEffect(() => {
    const proposal = getProposal();
    setValidateToggle(!validateToggle);
    setElementsO(
      (
        proposal.dataProductSDP?.map(rec => {
          const obs = proposal.observations?.find(o => o.id === rec.observationId);
          return obs ? popElementO(rec, obs) : null;
        }) ?? []
      ).filter((item): item is ReturnType<typeof popElementO> => item !== null)
    );
    setElementsT(proposal.targets?.map(rec => popElementT(rec)) ?? []);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    checkPartials();
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateLinkingPage(getProposal()), validateCalibrationPage(getProposal()));
  }, [validateToggle]);

  // NOTE : We used to have Groups in the list, so keep this until we are sure we don't need it.
  // const observationGroupIds = (id: string) => {
  //   if (
  //     getProposal()?.groupObservations &&
  //     getProposal()?.groupObservations?.some(e => e.observationId === id)
  //   ) {
  //     const group: GroupObservation[] =
  //       getProposal().groupObservations?.filter(e => e.observationId === id) ?? [];
  //     return group[0]?.groupId;
  //   }
  //   return '';
  // };

  const hasTargets = () => (elementsT?.length ?? 0) > 0;

  const hasObservations = () => elementsO?.length > 0;

  const getSensCalcForTargetGrid = (targetId: number) =>
    getProposal()?.targetObservation?.find(
      p => p.observationId === currObs?.id && p.targetId === targetId
    )?.sensCalc;

  const isCustom = () => currObs?.subarray === SA_CUSTOM;
  const isNatural = () => {
    const dp = elementsO.find(e => e.id === currObs?.id)?.dp;
    const weighting =
      typeof (dp?.data as any)?.weighting === 'string' ? (dp?.data as any).weighting : undefined;
    return currObs?.subarray !== SA_CUSTOM && weighting === IW_NATURAL;
  };

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
        field: 'id2',
        headerName: t('observations.id'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id2: string } }) => {
          return (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', pt: 1 }}>
              {e.row.id2}
            </Typography>
          );
        }
      },
      {
        field: 'id',
        headerName: t('observatoryDataProduct.id'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: string } }) => {
          return (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', pt: 1 }}>
              {e.row.id}
            </Typography>
          );
        }
      },
      // NOTE : We used to have Groups in the list, so keep this until we are sure we don't need it.
      // {
      //   field: 'id2',
      //   headerName: t('observations.group'),
      //   flex: 0.75,
      //   minWidth: 150,
      //   disableClickEventBubbling: true,
      //   renderCell: (e: { row: { id: number } }) => {
      //     return observationGroupIds((e.row.id as unknown) as string);
      //   }
      // },
      {
        field: 'telescope',
        headerName: t('observingBand.label'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: {
          row: { telescope: number; rec: { observingBand: string | number } };
        }) => {
          const colorsTelescope = getColors({
            type: 'telescope',
            colors: String(e.row.telescope),
            content: 'both',
            asArray: true,
            dim: 0.6,
            paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
          });
          return (
            <Box
              sx={{
                backgroundColor: colorsTelescope.bg[0],
                borderRadius: 1,
                px: 1,
                display: 'inline-flex'
              }}
            >
              <Typography
                variant="body2"
                color={colorsTelescope.fg[0]}
                sx={{ whiteSpace: 'nowrap', p: 1 }}
              >
                {t('observingBand.short.' + e.row.rec.observingBand)}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'subarray',
        headerName: t('subArrayConfiguration.short'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { telescope: number; subarray: string } }) => {
          const colorsTelescope = getColors({
            type: 'telescope',
            colors: String(e.row.telescope),
            content: 'both',
            asArray: true,
            paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
          });
          return (
            <Box
              sx={{
                backgroundColor: colorsTelescope.bg[0],
                borderRadius: 1,
                px: 1,
                display: 'inline-flex'
              }}
            >
              <Typography
                variant="body2"
                color={colorsTelescope.fg[0]}
                sx={{ whiteSpace: 'nowrap', p: 1 }}
              >
                {t('telescopes.' + e.row.telescope)} {t('subArrayConfiguration.' + e.row.subarray)}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'type',
        headerName: t('observationType.short'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { type: number } }) => {
          const colorsType = getColors({
            type: 'observationType',
            colors: String(e.row.type),
            content: 'both',
            asArray: true,
            dim: 0.6,
            paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
          });
          return (
            <Box
              sx={{
                backgroundColor: colorsType.bg[0],
                borderRadius: 1,
                px: 1,
                display: 'inline-flex'
              }}
            >
              <Typography
                variant="body2"
                color={'#000000'} //</Box>colorsType.fg[0]}
                sx={{ whiteSpace: 'nowrap', p: 1 }}
              >
                {t(`observationType.${e.row.type}`)}
              </Typography>
            </Box>
          );
        }
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
      <Grid
        pl={GAP}
        pr={GAP}
        container
        spacing={GAP}
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <Grid size={{ md: 12, lg: 6 }}>
          <BorderedSection title={t('observatoryDataProduct.linkedObservation')}>
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
          </BorderedSection>
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>
          <BorderedSection title={t('targetObservation.label')}>
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
          </BorderedSection>
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
