import React from 'react';
import { Grid } from '@mui/material';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { OBSERVATION } from '../../utils/constants';

export default function AddObservation() {
  const [arrayConfig, setArrayConfig] = React.useState('');
  const [subarrayConfig, setSubarrayConfig] = React.useState('');
  const [observingBand, setObservingBand] = React.useState('');
  const [observationType, setObservationType] = React.useState('');
  const [elevation, setElevation] = React.useState('');
  const [weather, setWeather] = React.useState('');

  const WIDTH_XS = 3;

  const arrayConfigurationField = () => (
    <Grid item xs={WIDTH_XS}>
      <DropDown
        options={OBSERVATION.array}
        testId="arrayConfig"
        value={arrayConfig}
        setValue={setArrayConfig}
        label="Array Configuration"
      />
    </Grid>
  );

  const subarrayConfigurationField = () => (
    <Grid item xs={WIDTH_XS}>
      {arrayConfig && OBSERVATION.array[parseInt(arrayConfig, 10) - 1].subarray && (
        <DropDown
          options={OBSERVATION.array[parseInt(arrayConfig, 10) - 1].subarray}
          testId="subarrayConfig"
          value={subarrayConfig}
          setValue={setSubarrayConfig}
          label="Subarray Configuration"
        />
      )}
    </Grid>
  );

  const observationTypeField = () => (
    <Grid item xs={WIDTH_XS}>
      <DropDown
        options={OBSERVATION.ObservationType}
        testId="observationType"
        value={observationType}
        setValue={setObservationType}
        label="Observation Type"
      />
    </Grid>
  );

  const observingBandField = () => (
    <Grid item xs={WIDTH_XS}>
      {arrayConfig && OBSERVATION.array[parseInt(arrayConfig, 10) - 1].band && (
        <DropDown
          options={OBSERVATION.array[parseInt(arrayConfig, 10) - 1].band}
          testId="observingBand"
          value={observingBand}
          setValue={setObservingBand}
          label="Observing Band"
        />
      )}
    </Grid>
  );

  const elevationField = () => (
    <Grid item xs={WIDTH_XS}>
      <TextEntry label="Elevation" testId="elevation" value={elevation} setValue={setElevation} />
    </Grid>
  );

  const weatherField = () => (
    <Grid item xs={WIDTH_XS}>
      <TextEntry label="Weather" testId="weather" value={weather} setValue={setWeather} />
    </Grid>
  );

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner proposalState={null} title="Add Observation" addPage={0} />
      </Grid>

      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
        spacing={1}
      >
        {arrayConfigurationField()}
        {subarrayConfigurationField()}
        {observationTypeField()}
        {observingBandField()}
        {elevationField()}
        {weatherField()}
      </Grid>
    </Grid>
  );
}
