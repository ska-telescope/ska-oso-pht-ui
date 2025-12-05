import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { BorderedSection, DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import RobustField from '@components/fields/robust/Robust.tsx';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import { useTheme } from '@mui/material/styles';
import PolarisationsField from '@/components/fields/polarisations/polarisations';
import {
  CHANNELS_OUT_MAX,
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  FOOTER_HEIGHT_PHT,
  IW_BRIGGS,
  NAV,
  PAGE_DATA_PRODUCTS,
  PULSAR_TIMING_VALUE,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import Proposal from '@/utils/types/proposal';
import ImageWeightingField from '@/components/fields/imageWeighting/imageWeighting';
import { DataProductSDP } from '@/utils/types/dataProduct';
import AddButton from '@/components/button/Add/Add';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { presentUnits } from '@/utils/present/present';
import Observation from '@/utils/types/observation';
import GridObservation from '@/components/grid/observation/GridObservation';
import ImageSizeField from '@/components/fields/imageSize/imageSize';
import ChannelsOutField from '@/components/fields/channelsOut/channelsOut';
import DataProductTypeField from '@/components/fields/dataProductType/dataProductType';
import TaperField from '@/components/fields/taper/taper';
import TimeAveragingField from '@/components/fields/timeAveraging/timeAveraging';
import FrequencyAveragingField from '@/components/fields/frequencyAveraging/frequencyAveraging';
import BitDepthField from '@/components/fields/bitDepth/bitDepth';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { generateId } from '@/utils/helpers';
import { useHelp } from '@/utils/help/useHelp';
import ContinuumSubtractionField from '@/components/fields/continuumSubtraction/continuumSubtraction';

const GAP = 5;
const BACK_PAGE = PAGE_DATA_PRODUCTS;
const PAGE_PREFIX = 'SDP';
const LABEL_WIDTH = 5;
const COL = 6;
const COL_MID = 8;

interface DataProductProps {
  data?: DataProductSDP;
}

export default function DataProduct({ data }: DataProductProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const locationProperties = useLocation();
  const theme = useTheme();
  const { osdCyclePolicy } = useOSDAccessors();
  const { setHelp } = useHelp();

  const isEdit = () => locationProperties.state !== null || data !== undefined;

  const { application, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [baseObservations, setBaseObservations] = React.useState<Observation[]>([]);
  const [id, setId] = React.useState('');
  const [observationId, setObservationId] = React.useState('');
  const [dataProductType, setDataProductType] = React.useState(1);
  const [bitDepth, setBitDepth] = React.useState(0);
  const [imageSizeValue, setImageSizeValue] = React.useState(0);
  const [imageSizeUnits, setImageSizeUnits] = React.useState(0);
  const [pixelSizeValue, setPixelSizeValue] = React.useState(0);
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState(2);
  const [taperValue, setTaperValue] = React.useState(0);
  const [timeAveraging, setTimeAveraging] = React.useState(0);
  const [timeAveragingUnits, setTimeAveragingUnits] = React.useState(0);
  const [frequencyAveraging, setFrequencyAveraging] = React.useState(0);
  const [frequencyAveragingUnits, setFrequencyAveragingUnits] = React.useState(0);
  const [weighting, setWeighting] = React.useState(0);
  const [robust, setRobust] = React.useState(0);
  const [channelsOut, setChannelsOut] = React.useState(1);
  const [continuumSubtraction, setContinuumSubtraction] = React.useState(false);
  const [polarisations, setPolarisations] = React.useState<string[]>([]);

  const maxObservationsReached = () => baseObservations.length >= osdCyclePolicy.maxObservations;

  const isDataTypeOne = () => dataProductType === 1;

  const isFlowThrough = () => getObservation()?.pstMode === FLOW_THROUGH_VALUE;
  const isDetectedFilterbank = () => getObservation()?.pstMode === DETECTED_FILTER_BANK_VALUE;
  const isPulsarTiming = () => getObservation()?.pstMode === PULSAR_TIMING_VALUE;

  const isContinuum = () =>
    getObservation()?.type === TYPE_CONTINUUM || getProposal()?.scienceCategory === TYPE_CONTINUUM;
  const isSpectral = () =>
    getObservation()?.type === TYPE_ZOOM || getProposal()?.scienceCategory === TYPE_ZOOM;
  const isPST = () =>
    getObservation()?.type === TYPE_PST || getProposal()?.scienceCategory === TYPE_PST;

  const getObservation = () => baseObservations?.find(obs => obs.id === observationId);

  const getSuffix = () => {
    if (isContinuum() || isPST()) {
      return dataProductType.toString();
    }
    return '1';
  };

  const dataProductIn = (dp: DataProductSDP) => {
    setId(dp.id);
    setObservationId(dp.observationId);
    setDataProductType(dp.dataProductType ?? 0);
    setImageSizeValue(dp.imageSizeValue);
    setImageSizeUnits(dp.imageSizeUnits);
    setPixelSizeValue(dp.pixelSizeValue);
    setPixelSizeUnits(dp.pixelSizeUnits);
    setTaperValue(dp.taperValue);
    setWeighting(dp.weighting);
    setRobust(dp.robust ?? 0);
    setPolarisations(dp.polarisations ?? []);
    setChannelsOut(dp.channelsOut ?? 1);
    setTimeAveraging(dp.timeAveraging ?? 0);
    setFrequencyAveraging(dp.frequencyAveraging ?? 0);
    setContinuumSubtraction(dp.continuumSubtraction ?? false);
    setBitDepth(dp.bitDepth ?? 1);
  };

  const dataProductOut = () => {
    const newDataProduct: DataProductSDP = {
      id: id,
      dataProductType,
      observationId,
      imageSizeValue,
      imageSizeUnits,
      pixelSizeValue,
      pixelSizeUnits,
      weighting,
      robust,
      polarisations,
      channelsOut,
      taperValue,
      fitSpectralPol: 3,
      timeAveraging,
      frequencyAveraging,
      bitDepth,
      continuumSubtraction
    };
    return newDataProduct;
  };

  /* ------------------------------------------- */

  const addToProposal = () => {
    const newDataProduct: DataProductSDP = {
      id: generateId(PAGE_PREFIX, 6),
      dataProductType,
      observationId,
      imageSizeValue,
      imageSizeUnits,
      pixelSizeValue,
      pixelSizeUnits,
      weighting,
      robust,
      polarisations,
      channelsOut,
      taperValue,
      fitSpectralPol: 3,
      timeAveraging,
      frequencyAveraging,
      bitDepth,
      continuumSubtraction
    };
    setProposal({
      ...getProposal(),
      dataProductSDP: [...(getProposal()?.dataProductSDP ?? []), newDataProduct]
    });
  };

  const updateTnProposal = () => {
    const newDataProduct: DataProductSDP = dataProductOut();

    const oldDP = getProposal().dataProductSDP;
    const newDP: DataProductSDP[] = [];
    if (oldDP && oldDP?.length > 0) {
      oldDP.forEach(inValue => {
        newDP.push(inValue.id === newDataProduct.id ? newDataProduct : inValue);
      });
    } else {
      newDP.push(newDataProduct);
    }

    setProposal({
      ...getProposal(),
      dataProductSDP: newDP
    });
  };

  const updateStorageProposal = () => {
    if (osdCyclePolicy.maxDataProducts === 1) {
      isEdit() ? updateTnProposal() : addToProposal();
    }
  };

  /* ------------------------------------------- */

  React.useEffect(() => {
    setHelp('observations.dp');
    const proposal = getProposal();
    const observations = proposal?.observations ?? [];

    setBaseObservations(observations);
    if (isEdit()) {
      dataProductIn(data ? data : locationProperties.state);
    } else {
      // Nothing to do for now
    }
    // TODO : Need to set the appropriate setHelp value upon entry
  }, []);

  React.useEffect(() => {
    updateStorageProposal();
  }, [
    id,
    observationId,
    dataProductType,
    bitDepth,
    imageSizeValue,
    imageSizeUnits,
    pixelSizeValue,
    pixelSizeUnits,
    taperValue,
    timeAveraging,
    timeAveragingUnits,
    frequencyAveraging,
    frequencyAveragingUnits,
    weighting,
    robust,
    channelsOut,
    continuumSubtraction,
    polarisations
  ]);

  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const taperField = () =>
    fieldWrapper(
      <TaperField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('taper')}
        required
        setValue={setTaperValue}
        value={taperValue}
        suffix={t('taper.units')}
      />
    );

  const imageSizeUnitsField = () => {
    const getOptions = () => {
      return [0, 1, 2].map(e => ({
        label: presentUnits(t('imageSize.' + e)),
        value: e
      }));
    };

    return (
      <DropDown
        options={getOptions()}
        testId="frequencyUnits"
        value={imageSizeUnits}
        setValue={setImageSizeUnits}
        label=""
        onFocus={() => setHelp('frequencyUnits')}
      />
    );
  };

  const imageSizeField = () =>
    fieldWrapper(
      <ImageSizeField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('imageSize')}
        required
        setValue={setImageSizeValue}
        value={Number(imageSizeValue)}
        suffix={imageSizeUnitsField()}
      />
    );

  const timeAveragingUnitsField = () => {
    const getOptions = () => {
      return [0].map(e => ({
        label: presentUnits(t('timeAveraging.' + e)),
        value: e
      }));
    };

    return (
      <DropDown
        disabled
        options={getOptions()}
        testId="timeAveragingUnits"
        value={timeAveragingUnits}
        setValue={setTimeAveragingUnits}
        label=""
        onFocus={() => setHelp('timeAveragingUnits')}
      />
    );
  };

  const frequencyAveragingUnitsField = () => {
    const getOptions = () => {
      return [0].map(e => ({
        label: presentUnits('frequencyAveraging.' + e),
        value: e
      }));
    };

    return (
      <DropDown
        disabled
        options={getOptions()}
        testId="frequencyAveragingUnits"
        value={frequencyAveragingUnits}
        setValue={setFrequencyAveragingUnits}
        label=""
        onFocus={() => setHelp('frequencyAveragingUnits')}
      />
    );
  };

  const timeAveragingField = () =>
    fieldWrapper(
      <TimeAveragingField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('timeAveraging')}
        required
        setValue={setTimeAveraging}
        value={Number(timeAveraging)}
        suffix={timeAveragingUnitsField()}
      />
    );

  const frequencyAveragingField = () =>
    fieldWrapper(
      <FrequencyAveragingField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('frequencyAveraging')}
        required
        setValue={setFrequencyAveraging}
        value={Number(frequencyAveraging)}
        suffix={frequencyAveragingUnitsField()}
      />
    );

  const pixelSizeUnitsField = () => {
    return pixelSizeUnits === 0 || pixelSizeUnits === null
      ? ''
      : presentUnits(t('pixelSize.' + pixelSizeUnits));
  };

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('pixelSize')}
        setValue={setPixelSizeValue}
        required
        value={pixelSizeValue}
        suffix={pixelSizeUnitsField()}
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(
      <ImageWeightingField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('imageWeighting')}
        required
        setValue={setWeighting}
        value={weighting}
      />
    );

  const bitDepthField = () =>
    fieldWrapper(
      <BitDepthField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('bitDepth')}
        required
        setValue={setBitDepth}
        value={bitDepth}
      />
    );

  const dataProductTypeField = () =>
    fieldWrapper(
      <DataProductTypeField
        observationType={getObservation()?.type || TYPE_CONTINUUM}
        onFocus={() => setHelp('dataProductType')}
        setValue={setDataProductType}
        value={dataProductType}
      />
    );

  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        onFocus={() => setHelp('robust')}
        setValue={setRobust}
        value={robust}
      />
    );

  const channelsOutField = () =>
    fieldWrapper(
      <ChannelsOutField
        labelWidth={LABEL_WIDTH}
        onFocus={() => setHelp('channelsOut')}
        required
        setValue={setChannelsOut}
        value={channelsOut}
      />
    );

  const continuumSubtractionField = () =>
    fieldWrapper(
      <ContinuumSubtractionField
        onFocus={() => setHelp('continuumSubtraction')}
        setValue={setContinuumSubtraction}
        value={continuumSubtraction}
      />
    );

  const polarisationsField = () => {
    return (
      <PolarisationsField
        onFocus={() => setHelp('polarisations')}
        observationType={getObservation()?.type || TYPE_CONTINUUM}
        dataProductType={dataProductType}
        value={polarisations}
        setValue={setPolarisations}
        labelWidth={0}
      />
    );
  };

  const imageSizeValid = () => Number(imageSizeValue) > 0;
  const pixelSizeValid = () => pixelSizeValue > 0;
  const taperSizeValid = () => taperValue > 0;
  const channelsOutValid = () => channelsOut > 0 && channelsOut <= CHANNELS_OUT_MAX;
  const polarisationsValid = () => polarisations.length > 0;
  const timeAveragingValid = () => timeAveraging > 0;
  const frequencyAveragingValid = () => frequencyAveraging > 0;

  const pageFooter = () => {
    const enabled = () => {
      switch (getObservation()?.type) {
        case TYPE_ZOOM:
          return (
            pixelSizeValid() &&
            imageSizeValid() &&
            taperSizeValid() &&
            channelsOutValid() &&
            polarisationsValid()
          );
        case TYPE_PST:
          if (isFlowThrough()) {
            return polarisationsValid();
          } else if (isDetectedFilterbank()) {
            return timeAveragingValid() && frequencyAveragingValid() && polarisationsValid();
          }
          break;
        case TYPE_CONTINUUM:
        default:
          if (isDataTypeOne()) {
            return (
              pixelSizeValid() &&
              imageSizeValid() &&
              taperSizeValid() &&
              channelsOutValid() &&
              polarisationsValid()
            );
          } else {
            return timeAveragingValid() && frequencyAveragingValid();
          }
      }
    };

    const buttonClicked = () => {
      isEdit() ? updateTnProposal() : addToProposal();
      if (osdCyclePolicy.maxDataProducts !== 1) {
        navigate(NAV[BACK_PAGE]);
      }
    };

    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT,
          left: 0,
          right: 0
        }}
        elevation={0}
      >
        <Grid
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid />
          <Grid />
          <Grid>
            <AddButton
              disabled={!enabled()}
              primary
              action={buttonClicked}
              testId={'addDataProductButtonEntry'}
              title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        minHeight: 0
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        spacing={GAP}
        m={GAP}
        mt={1}
        sx={{ flexGrow: 1 }}
      >
        <Grid size={{ md: 4, lg: 2 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: '#ccc',
              borderRadius: '8px',
              minHeight: 0
            }}
          >
            {baseObservations && (
              <GridObservation
                data={baseObservations}
                rowClick={(e: any) => setObservationId(e.row.id)}
                disabled={maxObservationsReached()}
              />
            )}
          </Box>
        </Grid>
        <Grid size={{ md: 7, lg: 7 }}>
          <Stack spacing={GAP}>
            {isContinuum() && <Box sx={{ width: '500px' }}>{dataProductTypeField()}</Box>}

            {isContinuum() && (
              <BorderedSection title={t('page.7.group.' + TYPE_CONTINUUM + '.' + dataProductType)}>
                {isDataTypeOne() && (
                  <Grid pb={1} container spacing={GAP}>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(imageSizeField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(pixelSizeField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {fieldWrapper(imageWeightingField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(taperField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(channelsOutField())}</Grid>
                  </Grid>
                )}
                {!isDataTypeOne() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(timeAveragingField())}</Grid>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(frequencyAveragingField())}</Grid>
                  </Grid>
                )}
              </BorderedSection>
            )}

            {isSpectral() && (
              <BorderedSection title={t('page.7.group.' + TYPE_ZOOM)}>
                <Grid pb={1} container>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(imageSizeField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(pixelSizeField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(imageWeightingField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>
                    {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                  </Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(taperField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(channelsOutField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>
                    {fieldWrapper(continuumSubtractionField())}
                  </Grid>
                </Grid>
              </BorderedSection>
            )}

            {isPST() && (
              <BorderedSection title={t('page.7.group.' + TYPE_PST + '.' + dataProductType)}>
                {isFlowThrough() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(bitDepthField())}</Grid>
                  </Grid>
                )}
                {isPulsarTiming() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(bitDepthField())}</Grid>
                  </Grid>
                )}
                {isDetectedFilterbank() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(timeAveragingField())}</Grid>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(frequencyAveragingField())}</Grid>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(bitDepthField())}</Grid>
                  </Grid>
                )}
              </BorderedSection>
            )}

            {((isContinuum() && isDataTypeOne()) || isSpectral() || isPST()) && (
              <BorderedSection
                borderColor={polarisationsValid() ? 'text.disabled' : theme.palette.error.main}
                title={t('polarisations.label')}
              >
                {fieldWrapper(
                  polarisationsField(),
                  (isContinuum() && isDataTypeOne()) || isSpectral() ? '150px' : undefined
                )}
              </BorderedSection>
            )}
          </Stack>
        </Grid>

        <Grid size={{ md: 11, lg: 3 }}>
          <BorderedSection borderColor={theme.palette.info.main} title={t('page.7.descTitle')}>
            <Typography variant="subtitle1" color="text.disabled">
              {t('page.7.descContent.' + getObservation()?.type + '.' + getSuffix())
                .split('\n')
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {line.trim()}
                    <br />
                  </React.Fragment>
                ))}
            </Typography>
          </BorderedSection>
        </Grid>
      </Grid>
      {osdCyclePolicy.maxDataProducts !== 1 && pageFooter()}
    </Box>
  );
}
