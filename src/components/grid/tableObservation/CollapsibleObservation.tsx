import { Box, Grid } from '@mui/material';
import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  BAND_LOW,
  BANDWIDTH_TELESCOPE,
  FREQUENCY_UNITS,
  LAB_POSITION,
  TYPE_CONTINUUM,
  TYPE_ZOOM
} from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Proposal from '@/utils/types/proposal';
import GroupObservation from '@/utils/types/groupObservation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { OSD_CONSTANTS } from '@/utils/OSDConstants';

export default function CollapsibleObservation({ obs }: any) {
  const { t } = useScopedTranslation();
  const { application } = storageObject.useStore();
  const isLow = () => obs.observingBand === BAND_LOW;
  const isContinuum = () => obs.observationType === TYPE_CONTINUUM;
  // const { osdLOW, osdMID, observatoryConstants } = useOSDAccessors();

  const getProposal = () => application.content2 as Proposal;

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

  const supplied = (inObs: any) =>
    OSD_CONSTANTS.Supplied.find(s => s.value === inObs?.rec.supplied?.type);

  return (
    <Grid container spacing={2} sx={{ width: '100%' }}>
  <Grid xs={12} md={6}>
    <Grid container spacing={2} direction="column">
      <Grid>
        <TextEntry
          label={t('observationType.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId={'observationType'}
          value={t('observationType.' + obs.type)}
        />
      </Grid>

      <Grid>
        <TextEntry
          label="Group"
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="group"
          value={observationGroupIds(obs.id)}
        />
      </Grid>

      <Grid>
        <TextEntry
          label={t('subArrayConfiguration.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="subarray"
          value={t('subArrayConfiguration.' + obs.subarray)}
        />
      </Grid>

      <Grid>
        <TextEntry
          label={t('elevation.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="elevation"
          value={obs.rec.elevation}
          suffix="deg"
        />
      </Grid>

      <Grid>
        <TextEntry
          label={supplied(obs)?.label}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="supplied"
          value={obs.rec.supplied.value}
          suffix={
            supplied(obs)?.units?.find(
              unit => unit.value === obs.rec.supplied.units
            )?.label || 'error'
          }
        />
      </Grid>
    </Grid>
  </Grid>
  <Grid item xs={12} md={6}>
    <Grid container spacing={2} direction="column">
      <Grid item >
        <TextEntry
          label={t('observingBand.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="observingBand"
          value={BANDWIDTH_TELESCOPE[Number(obs.rec.observingBand)]?.label}
        />
      </Grid>

      <Grid item>
        <TextEntry
          label={t('centralFrequency.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="centralFrequency"
          value={obs.rec.centralFrequency}
          suffix={
            FREQUENCY_UNITS.find(
              unit => unit.value === obs.rec.centralFrequencyUnits
            )?.label
          }
        />
      </Grid>

      <Grid item>
        <TextEntry
          label={
            isContinuum()
              ? t(`bandwidth.label.${TYPE_CONTINUUM}`)
              : t(`bandwidth.label.${TYPE_ZOOM}`)
          }
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="bandwidth"
          value={
            isContinuum() ? obs.rec.bandwidth : obs.rec.continuumBandwidth
          }
          suffix={
            isContinuum()
              ? FREQUENCY_UNITS.find(
                  unit => unit.value === obs.rec.continuumBandwidthUnits
                )
              : 'Mhz'
          }
        />
      </Grid>

      <Grid item>
        <TextEntry
          label={t('subBands.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={10}
          testId="subBands"
          value={obs.rec.numSubBands}
        />
      </Grid>
    </Grid>
  </Grid>
</Grid>


    // <Grid
    //   pl={4}
    //   pr={4}
    //   container
    //   direction="row"
    //   alignItems="space-evenly"
    //   justifyContent="space-between"
    //   spacing={1}
    // >
    //   <Grid size={{ md: 12, lg: 9 }}>
    //     <Grid
    //       p={0}
    //       pl={2}
    //       container
    //       direction="row"
    //       alignItems="center"
    //       spacing={1}
    //       justifyContent="space-around"
    //     >
    //       <Grid size={{ md: 12, lg: 5 }}>{idField()}</Grid>
    //       <Grid size={{ lg: 5 }}></Grid>
    //       <Grid size={{ md: 12, lg: 5 }}>{groupObservationsField()}</Grid>
    //       <Grid size={{ md: 12, lg: 5 }}>{isLow() ? emptyField() : weatherField()}</Grid>
    //       <Grid size={{ md: 12, lg: 5 }}>{observationsBandField()}</Grid>
    //       <Grid size={{ md: 12, lg: 5 }}>{elevationField()}</Grid>
    //       <Grid size={{ md: 12, lg: 5 }}>{subArrayField()}</Grid>
    //       <Grid size={{ md: 12, lg: 5 }}>{isLow() ? numStationsField() : antennasFields()}</Grid>
    //     </Grid>
    //     <Card variant="outlined">
    //       <CardContent>
    //         <Grid
    //           p={0}
    //           container
    //           direction="row"
    //           alignItems="center"
    //           spacing={1}
    //           justifyContent="space-around"
    //         >
    //           <Grid size={{ md: 12, lg: 5 }}>{observationTypeField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>{suppliedField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}> {centralFrequencyField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>
    //             {isContinuum() ? continuumBandwidthField() : bandwidthField()}
    //           </Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>{spectralResolutionField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>{spectralAveragingField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>{effectiveResolutionField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>
    //             {isContinuum() ? SubBandsField() : emptyField()}
    //           </Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>{imageWeightingField()}</Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>
    //             {imageWeighting === IW_BRIGGS ? robustField() : emptyField()}
    //           </Grid>
    //           <Grid size={{ md: 12, lg: 5 }}>{isLow() ? emptyField() : taperingField()}</Grid>
    //           <Grid size={{ lg: 5 }}>{isLow() ? <></> : emptyField()}</Grid>
    //         </Grid>
    //       </CardContent>
    //     </Card>
    //   </Grid>
    //   <Grid size={{ md: 12, lg: 3 }}>
    //     <Box pl={4} sx={{ position: 'sticky', top: 100 }}>
    //       <HelpPanel maxHeight={HELP_PANEL_HEIGHT} />
    //     </Box>
    //   </Grid>
    // </Grid>
  );
}
