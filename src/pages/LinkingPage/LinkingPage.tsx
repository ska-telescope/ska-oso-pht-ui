import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { storageObject } from '@utils/storage/store';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import {
  buildCalibrationStrategy,
  calibrationNotesFor
} from '@/models/proposals/calibrationOperations';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import {
  AlertColorTypes,
  BorderedSection,
  DataGrid,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { getColors } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import SensCalcDisplaySingle from '../../components/alerts/sensCalcDisplay/single/SensCalcDisplaySingle';
import Observation from '../../utils/types/observation';
import { getSubmitPageStatuses } from '@/models/proposals/submit';
import {
  SA_CUSTOM,
  PAGE_CALIBRATION,
  PAGE_LINKING,
  REFERENCE_COORDINATE_TYPE_ICRS,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_OK,
  STATUS_PARTIAL,
  SUPPLIED_TYPE_INTEGRATION,
  NOTIFICATION_DELAY_IN_SECONDS
} from '../../utils/constants';
import Target from '../../utils/types/target';
import TargetObservation from '../../utils/types/targetObservation';
import DeleteObservationConfirmation from '../../components/alerts/deleteObservationConfirmation/deleteObservationConfirmation';
import SensCalcModalMultiple from '../../components/alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import StatusIconDisplay from '../../components/icon/status/statusIcon';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { isNonGaussianBeamWeighting } from '@/utils/helpersSensCalc';
import { SensCalcResults } from '@/utils/types/sensCalcResults';
import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';
import { DataProductSDPNew } from '@/utils/types/dataProduct';
import ObservingBand from '@/components/display/observingBand/observingBand';
import ObservingType from '@/components/display/observingType/observingType';
import getSensCalc from '@services/axios/get/getSensitivityCalculator/sensitivityCalculator/getSensitivityCalculatorAPIData.ts';

export const isNonGaussianSensitivityCase = ({
  subarray,
  weighting,
  robust
}: {
  subarray?: string;
  weighting?: number | string | null;
  robust?: number | string | null;
}) => {
  return subarray !== SA_CUSTOM && isNonGaussianBeamWeighting(weighting, robust);
};

export default function LinkingPage() {
  const DATA_GRID_TARGET = '60vh';
  const DATA_GRID_OBSERVATION = '60vh';
  const PAGE = PAGE_LINKING;
  const GAP = 5;

  const { t } = useScopedTranslation();

  const { axiosClient: authAxiosClient } = useAxiosAuthClient();
  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currRec, setCurrRec] = React.useState<any | null>(null);
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

  // The form owns the targets, links and calibration; watching them re-renders the page on change
  const form = useFormContext<ProposalType>();
  const watchedSlices = useWatch({
    control: form.control,
    name: ['targets', 'targetObservation', 'calibrationStrategy']
  });
  const getTargets = () => (form.getValues('targets') ?? []) as Target[];
  const getLinks = () => (form.getValues('targetObservation') ?? []) as TargetObservation[];
  const getCalibration = () =>
    (form.getValues('calibrationStrategy') ?? []) as CalibrationStrategy[];

  const { notifyError } = useNotify();

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
    filteredByDataProduct(obs.id)?.forEach((rec) => {
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
    filteredByDataProduct(obs.id)?.forEach((rec) => {
      if (typeof rec !== 'undefined' && rec.statusGUI === STATUS_ERROR) {
        result = rec.error ?? '';
      }
    });
    return result;
  };

  const setTargetObservationAndCalibrationStorage = (
    targetObservations: TargetObservation[],
    calibration: CalibrationStrategy[]
  ) => {
    form.setValue('targetObservation', targetObservations);
    form.setValue('calibrationStrategy', [...calibration]);
  };

  const addTargetObservationAndCalibrationStorage = (
    targetObs: TargetObservation,
    calibration: CalibrationStrategy
  ) => {
    setTargetObservationAndCalibrationStorage([...(getLinks() ?? []), targetObs], [calibration]);
  };

  const updateTargetObservationStorage = async (
    target: Target,
    observationId: string,
    dataProductsSDPId: string,
    results?: SensCalcResults
  ) => {
    const temp = {
      observationId: observationId,
      dataProductsSDPId: dataProductsSDPId,
      targetId: target.id,
      sensCalc: results
    };
    const base = getLinks()?.filter(
      (e) => !(e.targetId === target.id && e.observationId === observationId)
    );
    base?.push(temp);

    const calibration = await buildCalibrationStrategy(authAxiosClient, {
      observationId,
      observation: getProposal().observations?.find((o) => o.id === observationId),
      target,
      notes: calibrationNotesFor(getCalibration(), observationId)
    });

    setTargetObservationAndCalibrationStorage(base ?? [], [calibration]);
  };

  const deleteObservationTargetAndCalibration = (row: any) => {
    function filterRecords(id: string) {
      return getLinks()?.filter(
        (item) => !(item.observationId === currRec?.id2 && item.targetId === id)
      );
    }
    function filterRecordsCalibration(id: number) {
      return getCalibration()?.filter((item) => item.observationIdRef === id.toString());
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
    id: string;
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

  // TODO(BTN-3595): Move these sensitivity requests (getSensCalcData and checkPartials) onto the
  //  shared sensitivity service. They have no protection against stale responses today. The
  //  calibration they write already comes from buildCalibrationStrategy (BTN-3593).
  const getSensCalcData = async (
    observation: Observation,
    target: Target,
    dataProductSDP: DataProductSDPNew
  ) => {
    const response = await getSensCalc(observation, target, dataProductSDP);
    if (response?.error) {
      const errMsg = response.error;
      notifyError(errMsg, NOTIFICATION_DELAY_IN_SECONDS);
    }

    await updateTargetObservationStorage(target, observation.id, dataProductSDP.id, response);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().observations?.filter((e) => e.id !== currRec?.id2) ?? [];
    const obs3 =
      getProposal().groupObservations?.filter((e) => e.observationId !== currRec?.id2) ?? [];
    form.setValue(
      'targetObservation',
      getLinks().filter((e) => e.observationId !== currRec?.id2)
    );
    setProposal({
      ...getProposal(),
      observations: obs1,
      groupObservations: obs3
    });
    setElementsO(elementsO.filter((e) => e.id !== currRec?.id));
    setCurrRec(null);
    closeDeleteDialog();
  };

  const addObservationTargetAndCalibration = async (target: Target) => {
    if (!currRec) return;
    const targetObs: TargetObservation = {
      observationId: currRec.id2,
      targetId: target.id,
      dataProductsSDPId: currRec.id ?? '',
      sensCalc: {
        statusGUI: STATUS_PARTIAL,
        error: ''
      }
    };

    const calibration = await buildCalibrationStrategy(authAxiosClient, {
      observationId: currRec.id2,
      observation: getProposal().observations?.find((o) => o.id === currRec.id2),
      target
    });
    addTargetObservationAndCalibrationStorage(targetObs, calibration);
  };

  const isTargetSelected = (targetId: string) =>
    (getLinks() ?? []).filter(
      (entry) => entry.dataProductsSDPId === currRec?.id && entry.targetId === targetId
    ).length > 0;

  const targetSelectedToggle = async (el: ElementT) => {
    if (isTargetSelected(el.id)) {
      deleteObservationTargetAndCalibration(el.target);
    } else {
      await addObservationTargetAndCalibration(el.target);
    }
  };

  const checkPartials = () => {
    const proposal = getProposal();
    const results = getLinks().find((p) => p.sensCalc?.statusGUI === STATUS_PARTIAL);
    if (results) {
      const target = getTargets().find((e) => e.id === results.targetId);
      const observation = proposal.observations?.find((e) => e.id === results.observationId);
      const dataProductSDP = proposal.dataProductSDP?.find(
        (d) => d.id === results.dataProductsSDPId
      );
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
        proposal.dataProductSDP?.map((rec) => {
          const obs = proposal.observations?.find((o) => o.id === rec.observationId);
          return obs ? popElementO(rec, obs) : null;
        }) ?? []
      ).filter((item): item is ReturnType<typeof popElementO> => item !== null)
    );
    setElementsT(getTargets().map((rec) => popElementT(rec)));
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    checkPartials();
  }, [getProposal(), ...watchedSlices]);

  React.useEffect(() => {
    const statuses = getSubmitPageStatuses(form.getValues());
    setTheProposalState(statuses.linking, statuses.calibration);
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

  const getTargetObservationForTargetGrid = (targetId: string): TargetObservation | undefined =>
    getLinks()?.find((p) => p.observationId === currRec?.id2 && p.targetId === targetId);

  const isCustom = () => currRec?.subarray === SA_CUSTOM || currRec?.rec?.subarray === SA_CUSTOM;
  const isNatural = () => {
    const selectedDp = currRec?.dp ?? elementsO.find((e) => e.id2 === currRec?.id2)?.dp;
    return isNonGaussianSensitivityCase({
      subarray: currRec?.subarray ?? currRec?.rec?.subarray,
      weighting: selectedDp?.data?.weighting,
      robust: selectedDp?.data?.robust
    });
  };

  const getSensCalcSingle = (id: string, field: string) => {
    return (
      <SensCalcDisplaySingle
        targetObservation={getTargetObservationForTargetGrid(id)}
        show={isTargetSelected(id)}
        field={field}
        isCustom={isCustom()}
        isNatural={isNatural()}
      />
    );
  };

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
          return (
            <ObservingBand telescope={e.row.telescope} band={String(e.row.rec.observingBand)} />
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
                sx={{
                  color: colorsTelescope.fg[0],
                  whiteSpace: 'nowrap',
                  p: 1
                }}
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
          return <ObservingType type={String(e.row.type)} />;
        }
      },
      {
        field: 'weather',
        headerName: 'Status',
        sortable: false,
        width: 100,
        disableClickEventBubbling: true,
        renderCell: (e: { row: any }) => {
          const rec = elementsO.find((p) => p.id === e.row.id);
          return (
            <>
              {
                <StatusIconDisplay
                  ariaDescription=" "
                  ariaTitle={t('sensCalc.' + getLevel(rec))}
                  level={getLevel(rec)}
                  onClick={() =>
                    getLevel(rec) === STATUS_INITIAL ? null : setOpenMultipleDialog(true)
                  }
                  testId="testId"
                  toolTip={t('sensCalc.' + getLevel(rec))}
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
            sx={{
              pl: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              margin: 0
            }}
          >
            {currRec ? <TriStateCheckbox state={checkState} setState={setCheckState} /> : <></>}
          </Box>
        ),
        disableClickEventBubbling: true,
        filterable: false,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (e: { row: ElementT }) => {
          return currRec ? (
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
      {
        field: 'raStr',
        headerName: t('skyDirection.short.1.' + REFERENCE_COORDINATE_TYPE_ICRS.value),
        width: 120
      },
      {
        field: 'decStr',
        headerName: t('skyDirection.short.2.' + REFERENCE_COORDINATE_TYPE_ICRS.value),
        width: 120
      },
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
          currRec?.rec ? (
            <>
              {t(
                isIntegrationTime(currRec?.rec as Observation)
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
            isIntegrationTime(currRec?.rec as Observation)
              ? 'SensitivityWeighted'
              : 'IntegrationTime'
          );
        }
      },
      {
        field: 'vel2',
        renderHeader: () =>
          currRec?.rec ? <>{t('sensitivityCalculatorResults.beamSize')}</> : <></>,
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
    else if (checkState === 'checked') return safeElementsT.filter((e) => isTargetSelected(e.id));
    else if (checkState === 'unchecked')
      return safeElementsT.filter((e) => !isTargetSelected(e.id));
    else return [];
  };

  const filteredByDataProduct = (id: string) => {
    const results: SensCalcResults[] = [];
    getLinks()?.forEach((rec) => {
      if (rec.dataProductsSDPId === id && rec.sensCalc != undefined) {
        results.push(rec.sensCalc);
      }
    });
    return results;
  };

  return (
    <Shell page={PAGE}>
      <Grid
        container
        spacing={GAP}
        direction="row"
        sx={{
          pl: GAP,
          pr: GAP,
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
      >
        <Grid size={{ md: 12, lg: 6 }}>
          <BorderedSection title={t('observatoryDataProduct.linkedObservation')}>
            {hasObservations() && (
              <DataGrid
                rows={elementsO}
                columns={extendedColumnsObservations}
                height={DATA_GRID_OBSERVATION}
                onRowClick={(e: { row: { rec: React.SetStateAction<Observation | null> } }) =>
                  setCurrRec(e.row)
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
      <>
        {openDeleteDialog && currRec?.Obs && (
          <DeleteObservationConfirmation
            action={deleteConfirmed}
            observation={currRec?.Obs}
            open={openDeleteDialog}
            setOpen={setOpenDeleteDialog}
          />
        )}
        {openMultipleDialog && currRec?.rec && (
          <SensCalcModalMultiple
            open={openMultipleDialog}
            onClose={() => setOpenMultipleDialog(false)}
            data={filteredByDataProduct(currRec?.id)}
            observation={currRec?.rec}
            level={getLevel(currRec?.rec)}
            levelError={getError(currRec?.rec)}
            isCustom={isCustom()}
            isNatural={isNatural()}
          />
        )}
      </>
    </Shell>
  );
}
