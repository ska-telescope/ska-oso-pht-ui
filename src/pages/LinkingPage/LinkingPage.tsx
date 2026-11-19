import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { storageObject } from '@utils/storage/store';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { getFormCalibration, getFormLinks, getFormTargets } from '@/models/proposals/formSlices';
import {
  buildCalibrationStrategy,
  calibrationNotesFor,
  withCalibrationFor
} from '@/models/proposals/calibrationOperations';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import {
  AlertColorTypes,
  BorderedSection,
  DataGrid,
  TickBox
} from '@ska-telescope/ska-gui-components';
import { getColors } from '@ska-telescope/ska-gui-components';
import SensCalcDisplaySingle from '../../components/alerts/sensCalcDisplay/single/SensCalcDisplaySingle';
import { getSubmitPageStatuses } from '@/models/proposals/submit';
import {
  SA_CUSTOM,
  PAGE_CALIBRATION,
  PAGE_LINKING,
  REFERENCE_COORDINATE_TYPE_ICRS,
  SENSITIVITY_STATE,
  STATUS_ERROR,
  STATUS_INITIAL,
  STATUS_OK,
  STATUS_PARTIAL
} from '../../utils/constants';
import Target from '../../utils/types/target';
import TargetObservation from '../../utils/types/targetObservation';
import SensCalcModalMultiple, {
  SensCalcRow
} from '../../components/alerts/sensCalcModal/multiple/SensCalcModalMultiple';
import StatusIconDisplay from '../../components/icon/status/statusIcon';
import Shell from '../../components/layout/Shell/Shell';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import TriStateCheckbox from '@/components/fields/triStateCheckbox/TriStateCheckbox';
import { CalibrationStrategy } from '@/utils/types/calibrationStrategy';
import { DataProductInput } from '@/models/proposals/dataProducts';
import ObservingBand from '@/components/display/observingBand/observingBand';
import ObservingType from '@/components/display/observingType/observingType';
import { OBSERVING_MODE_TRANSLATION_KEY, TELESCOPE_NUMBER } from '@/models/proposals/observations';

const PAGE = PAGE_LINKING;

export default function LinkingPage() {
  const DATA_GRID_TARGET = '60vh';
  const DATA_GRID_OBSERVATION = '60vh';
  const GAP = 5;

  const { t } = useScopedTranslation();

  const { axiosClient: authAxiosClient } = useAxiosAuthClient();
  const { application, updateAppContent1 } = storageObject.useStore();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [openMultipleDialog, setOpenMultipleDialog] = React.useState(false);
  const [checkState, setCheckState] = React.useState<'checked' | 'unchecked' | 'indeterminate'>(
    'indeterminate'
  );

  const [rowSelectionModel, setRowSelectionModel] = React.useState<GridRowSelectionModel>([]);

  // The form owns the observations, data products, targets, links and calibration; watching them
  // re-renders the page on change
  const form = useFormContext<ProposalType>();
  const observations = useWatch({ control: form.control, name: 'observations' });
  const dataProducts = useWatch({ control: form.control, name: 'dataProducts' });
  useWatch({
    control: form.control,
    name: ['targets', 'targetObservation', 'calibrationStrategy']
  });

  const observationOf = (dataProduct: DataProductInput) =>
    observations.find((obs) => obs.id === dataProduct.observationId);
  const rows = dataProducts.filter((dataProduct) => observationOf(dataProduct));
  const selectedDataProduct = rows.find((dataProduct) => dataProduct.id === selectedId);
  const selectedObservation = selectedDataProduct && observationOf(selectedDataProduct);
  const getTargets = () => getFormTargets(form);
  const getLinks = () => getFormLinks(form);
  const getCalibration = () => getFormCalibration(form);

  // Write submit status checks into the status store (to be deleted in future refactor)
  const { linking, calibration } = getSubmitPageStatuses(form.getValues());
  React.useEffect(() => {
    const statuses = application.content1 as number[];
    if (
      !statuses ||
      statuses.length <= PAGE ||
      (statuses[PAGE] === linking && statuses[PAGE_CALIBRATION] === calibration)
    ) {
      return;
    }
    updateAppContent1(
      statuses.map((value, i) =>
        i === PAGE ? linking : i === PAGE_CALIBRATION ? calibration : value
      )
    );
  }, [linking, calibration, application.content1, updateAppContent1]);

  const getLevel = (dataProductId: string) => {
    let result = STATUS_INITIAL;
    filteredByDataProduct(dataProductId).forEach(({ sensitivity }) => {
      switch (sensitivity.state) {
        case SENSITIVITY_STATE.FAILED:
          result = STATUS_ERROR;
          return;
        case SENSITIVITY_STATE.CALCULATING:
          result = result !== STATUS_ERROR ? STATUS_PARTIAL : STATUS_ERROR;
          return;
        default:
          if (result !== STATUS_PARTIAL && result !== STATUS_ERROR) {
            result = STATUS_OK;
          }
      }
    });
    return result;
  };

  const getError = (dataProductId: string) => {
    let result = '';
    filteredByDataProduct(dataProductId).forEach(({ sensitivity }) => {
      if (sensitivity.state === SENSITIVITY_STATE.FAILED) {
        result = sensitivity.error;
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

  // Other observations keep their calibration; only this observation's strategy is replaced
  const addTargetObservationAndCalibrationStorage = (
    targetObs: TargetObservation,
    calibration: CalibrationStrategy
  ) => {
    setTargetObservationAndCalibrationStorage(
      [...getLinks(), targetObs],
      withCalibrationFor(getCalibration(), calibration)
    );
  };

  /** A target still linked to the observation, if any. */
  const linkedTargetFor = (observationId: string) =>
    getTargets().find((target) =>
      getLinks().some((link) => link.observationId === observationId && link.targetId === target.id)
    );

  // The observation's calibration goes with its last link; other observations keep theirs. While
  // another target is still linked, the calibrators are looked up again for it, as they may have
  // been chosen for the target just unlinked.
  const deleteObservationTargetAndCalibration = async (target: Target) => {
    const observationId = selectedDataProduct?.observationId;
    if (!observationId) return;
    form.setValue(
      'targetObservation',
      getLinks().filter(
        (link) => !(link.observationId === observationId && link.targetId === target.id)
      )
    );

    const remainingTarget = linkedTargetFor(observationId);
    if (!remainingTarget) {
      form.setValue(
        'calibrationStrategy',
        getCalibration().filter((item) => item.observationIdRef !== observationId)
      );
      return;
    }

    const observation = form.getValues('observations').find((o) => o.id === observationId);
    if (!observation) return;
    const calibration = await buildCalibrationStrategy(authAxiosClient, {
      observation,
      target: remainingTarget,
      notes: calibrationNotesFor(getCalibration(), observationId)
    });
    // The lookup takes time, so the strategy is only replaced if the observation is still linked
    if (linkedTargetFor(observationId)) {
      form.setValue('calibrationStrategy', withCalibrationFor(getCalibration(), calibration));
    }
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

  const addObservationTargetAndCalibration = async (target: Target) => {
    if (!selectedDataProduct || !selectedObservation) return;
    const observation = selectedObservation;
    const targetObs: TargetObservation = {
      observationId: observation.id,
      targetId: target.id,
      dataProductsSDPId: selectedDataProduct.id,
      sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
    };

    const calibration = await buildCalibrationStrategy(authAxiosClient, { observation, target });
    addTargetObservationAndCalibrationStorage(targetObs, calibration);
  };

  const isTargetSelected = (targetId: string) =>
    (getLinks() ?? []).filter(
      (entry) => entry.dataProductsSDPId === selectedId && entry.targetId === targetId
    ).length > 0;

  const targetSelectedToggle = async (el: ElementT) => {
    if (isTargetSelected(el.id)) {
      await deleteObservationTargetAndCalibration(el.target);
    } else {
      await addObservationTargetAndCalibration(el.target);
    }
  };

  const targetRows = getTargets().map((rec) => popElementT(rec));

  const hasTargets = () => targetRows.length > 0;

  const hasObservations = () => rows.length > 0;

  const getTargetObservationForTargetGrid = (targetId: string): TargetObservation | undefined =>
    getLinks()?.find((p) => p.dataProductsSDPId === selectedId && p.targetId === targetId);

  const isCustom = () => selectedObservation?.subarray === SA_CUSTOM;

  const getSensCalcSingle = (id: string, field: string) => {
    return (
      <SensCalcDisplaySingle
        targetObservation={getTargetObservationForTargetGrid(id)}
        show={isTargetSelected(id)}
        field={field}
        isCustom={isCustom()}
      />
    );
  };

  const extendedColumnsObservations = [
    ...[
      {
        field: 'observationId',
        headerName: t('observations.id'),
        flex: 0.75,
        minWidth: 150,
        disableClickEventBubbling: true,
        renderCell: (e: { row: DataProductInput }) => {
          return (
            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', pt: 1 }}>
              {e.row.observationId}
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
        renderCell: (e: { row: DataProductInput }) => {
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
        renderCell: (e: { row: DataProductInput }) => {
          const observation = observationOf(e.row);
          return (
            observation && (
              <ObservingBand
                telescope={TELESCOPE_NUMBER[observation.telescope]}
                band={observation.observingBand ?? undefined}
              />
            )
          );
        }
      },
      {
        field: 'subarray',
        headerName: t('subArrayConfiguration.short'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: { row: DataProductInput }) => {
          const observation = observationOf(e.row);
          if (!observation) return null;
          const colorsTelescope = getColors({
            type: 'telescope',
            colors: String(TELESCOPE_NUMBER[observation.telescope]),
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
                {t('telescopes.' + observation.telescope)}{' '}
                {t('subArrayConfiguration.' + observation.subarray)}
              </Typography>
            </Box>
          );
        }
      },
      {
        field: 'observingMode',
        headerName: t('observationType.short'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: { row: DataProductInput }) => {
          const observation = observationOf(e.row);
          return (
            observation && (
              <ObservingType type={OBSERVING_MODE_TRANSLATION_KEY[observation.observingMode]} />
            )
          );
        }
      },
      {
        field: 'weather',
        headerName: 'Status',
        sortable: false,
        width: 100,
        disableClickEventBubbling: true,
        renderCell: (e: { row: DataProductInput }) => {
          const level = getLevel(e.row.id);
          return (
            <StatusIconDisplay
              ariaTitle={t('sensCalc.' + level)}
              level={level}
              onClick={() => (level === STATUS_INITIAL ? null : setOpenMultipleDialog(true))}
              testId="testId"
              toolTip={t('sensCalc.' + level)}
            />
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
            {selectedDataProduct ? (
              <TriStateCheckbox state={checkState} setState={setCheckState} />
            ) : (
              <></>
            )}
          </Box>
        ),
        disableClickEventBubbling: true,
        filterable: false,
        sortable: false,
        disableColumnMenu: true,
        renderCell: (e: { row: ElementT }) => {
          return selectedDataProduct ? (
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
          selectedDataProduct ? (
            <>{t('sensitivityCalculatorResults.weightedSensitivity')}</>
          ) : (
            <></>
          ),
        sortable: false,
        flex: 2,
        minWidth: 170,
        disableClickEventBubbling: true,
        renderCell: (e: { row: any }) => {
          return getSensCalcSingle(e.row.id, 'SensitivityWeighted');
        }
      },
      {
        field: 'vel2',
        renderHeader: () =>
          selectedDataProduct ? <>{t('sensitivityCalculatorResults.beamSize')}</> : <></>,
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
    if (checkState === 'indeterminate') return targetRows;
    else if (checkState === 'checked') return targetRows.filter((e) => isTargetSelected(e.id));
    else if (checkState === 'unchecked') return targetRows.filter((e) => !isTargetSelected(e.id));
    else return [];
  };

  // The data product's links with results, named by their targets
  const filteredByDataProduct = (id: string): SensCalcRow[] =>
    getLinks().flatMap((link) =>
      link.dataProductsSDPId === id && link.sensitivity
        ? [
            {
              id: link.targetId,
              title: getTargets().find((target) => target.id === link.targetId)?.name ?? '',
              sensitivity: link.sensitivity
            }
          ]
        : []
    );

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
                rows={rows}
                columns={extendedColumnsObservations}
                height={DATA_GRID_OBSERVATION}
                onRowClick={(e: { row: DataProductInput }) => setSelectedId(e.row.id)}
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
                text={t('error.noObservations')}
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
                text={t('targets.empty')}
                testId="noTargetsNotification"
              />
            )}
          </BorderedSection>
        </Grid>
      </Grid>
      <>
        {openMultipleDialog && selectedDataProduct && selectedObservation && (
          <SensCalcModalMultiple
            open={openMultipleDialog}
            onClose={() => setOpenMultipleDialog(false)}
            data={filteredByDataProduct(selectedDataProduct.id)}
            observation={selectedObservation}
            level={getLevel(selectedDataProduct.id)}
            levelError={getError(selectedDataProduct.id)}
            isCustom={isCustom()}
          />
        )}
      </>
    </Shell>
  );
}
