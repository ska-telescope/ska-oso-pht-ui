import React from 'react';
import { Radio, FormControlLabel, Grid, Box } from '@mui/material';
import { DataGrid, TextEntry } from '@ska-telescope/ska-gui-components';
import { LAB_POSITION, RA_TYPE_ICRS } from '@utils/constants.ts';
import AddButton from '@components/button/Add/Add.tsx';
import AlertDialog from '@components/alerts/alertDialog/AlertDialog.tsx';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Target, { Beam, ReferenceCoordinateICRS } from '@utils/types/target.tsx';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
import ResolveButton from '@components/button/Resolve/Resolve.tsx';
import { name } from 'happy-dom/lib/PropertySymbol.js';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';

interface PulsarTimingBeamFieldProps {
  target?: Partial<Target>;
  onNewBeams?: (beams: Beam[]) => void;
}

export default function PulsarTimingBeamField({
  target,
  onNewBeams = () => {}
}: PulsarTimingBeamFieldProps) {
  const { t } = useScopedTranslation();
  const { helpComponent } = storageObject.useStore();
  const [selectedValue, setSelectedValue] = React.useState('noBeam');
  const [showGrid, setShowGrid] = React.useState(false);
  const [openPulsarTimingBeamDialog, setOpenPulsarTimingBeamDialog] = React.useState(false);
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [beamName, setBeamName] = React.useState('');
  const [beamRA, setBeamRA] = React.useState('');
  const [beamDec, setBeamDec] = React.useState('');
  const [beam, setBeam] = React.useState<Beam | null>(null);
  const [allBeams, setAllBeams] = React.useState<Beam[]>([]);
  const LAB_WIDTH = 5;
  const wrapper = (children: any) => <Box sx={{ width: '100%' }}>{children}</Box>;

  React.useEffect(() => {
    console.log('allBeams:', allBeams);
    // TODO notify parent component of the new beams
    onNewBeams(allBeams);
  }, [allBeams]);

  React.useEffect(() => {
    // reset beams if "noBeam" is selected
    if (selectedValue === 'noBeam') {
      setAllBeams([]);
    }
  }, [selectedValue]);

  const handleClick = (event: any) => {
    setSelectedValue(event.target.value);
  };

  const controlProps = (item: any) => ({
    checked: selectedValue === item,
    onClick: handleClick,
    value: item,
    name: 'radio-group',
    inputProps: { 'aria-label': item }
  });

  const addPulsarTimingBeamsConfirmed = () => {
    console.log('addPulsarTimingBeamsConfirmed', { beamName, beamRA, beamDec });
    if (beamName && beamRA && beamDec) {
      const newBeam: Beam = {
        id: Math.floor(Math.random() * 1000), // TODO improve id generation
        beamName: beamName,
        beamCoordinate: {
          kind: RA_TYPE_ICRS.label,
          raStr: beamRA,
          decStr: beamDec
        },
        stnWeights: []
      };
      console.log('newBeam:', newBeam);
      setAllBeams(prevBeams => {
        const updatedBeams = [...prevBeams];
        updatedBeams.push(newBeam);
        return updatedBeams;
      });
      setBeamName('');
      setBeamRA('');
      setBeamDec('');
    }
    closeDialog();
    setShowGrid(true);
  };

  const closeDialog = () => {
    setOpenPulsarTimingBeamDialog(false);
  };

  const setTheName = (inValue: string) => {
    setBeamName(inValue);
  };

  const setTheDec = (inValue: string) => {
    setBeamDec(inValue);
  };

  const setTheRA = (inValue: string) => {
    setBeamRA(inValue);
  };

  const resolveBeamNameButton = () => {
    const processCoordinatesResults = (response: any) => {
      if (response && !response.error) {
        const values = response.split(' ');
        setBeamDec(values[0]);
        setBeamRA(values[1]);
        setNameFieldError('');
      } else {
        setNameFieldError(t('resolve.error.' + response.error));
      }
    };

    const getCoordinates = async () => {
      const response = await GetCoordinates(beamName, RA_TYPE_ICRS.value);
      processCoordinatesResults(response);
    };

    return (
      <ResolveButton
        action={() => getCoordinates()}
        disabled={!beamName}
        testId={'resolveButton'}
      />
    );
  };

  const beamNameField = () =>
    wrapper(
      <TextEntry
        required
        label={t('name.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={LAB_WIDTH}
        testId={'beamName'}
        setValue={setTheName}
        value={beamName}
        suffix={resolveBeamNameButton()}
        onFocus={() => helpComponent(t('name.help'))}
        errorText={nameFieldError}
      />
    );

  const skyDirection1Field = () =>
    wrapper(
      <SkyDirection1
        labelWidth={LAB_WIDTH}
        skyUnits={RA_TYPE_ICRS.value}
        setValue={setTheRA}
        value={beamRA}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        skyUnits={RA_TYPE_ICRS.value}
        setValue={setTheDec}
        value={beamDec}
        valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
      />
    );

  const alertPulsarTimingBeamsContent = () => {
    return (
      <Grid container direction="column" alignItems="center" justifyContent="space-around">
        <Grid>{beamNameField()}</Grid>
        <Grid>{skyDirection1Field()}</Grid>
        <Grid>{skyDirection2Field()}</Grid>
      </Grid>
    );
  };

  const columns = [
    { field: 'beamName', headerName: t('name.label'), flex: 1.5 },
    {
      field: 'raStr',
      headerName: t('skyDirection.short.1.' + RA_TYPE_ICRS.value),
      width: 120,
      renderCell: (e: { row: Beam }) => (e.row?.beamCoordinate as ReferenceCoordinateICRS)?.raStr
    },
    {
      field: 'decStr',
      headerName: t('skyDirection.short.2.' + RA_TYPE_ICRS.value),
      width: 120,
      renderCell: (e: { row: Beam }) => (e.row?.beamCoordinate as ReferenceCoordinateICRS)?.decStr
    }
  ];

  const getColumns = () => columns;

  const addBeamDisabled = () => {
    return !(
      target &&
      typeof target.name === 'string' &&
      target.name.length > 0 &&
      typeof target.raStr === 'string' &&
      target.raStr.length > 0 &&
      typeof target.decStr === 'string' &&
      target.decStr.length > 0
    );
  };

  return (
    <div>
      <FormControlLabel
        control={<Radio {...controlProps('noBeam')} color="default" />}
        label={t('pulsarTimingBeam.noBeam.label')}
        data-testid="NoBeamTestId"
      />
      <FormControlLabel
        control={<Radio {...controlProps('multipleBeams')} color="default" />}
        label={t('pulsarTimingBeam.multipleBeams.label')}
        data-testid="MultipleBeamsTestId"
      />
      {showGrid && allBeams.length > 0 && (
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={allBeams}
            columns={getColumns()}
            height={allBeams.length * 60 + 100}
            testId="pulsarTimingBeamColumns"
          />
        </div>
      )}

      {/* End of grid display */}

      {/* AddButton and Dialogs */}
      {selectedValue === 'multipleBeams' && (
        <AddButton
          action={() => setOpenPulsarTimingBeamDialog(true)}
          testId={'addPulsarTimingBeamButton'}
          toolTip={'pulsarTimingBeam.toolTip'}
          disabled={addBeamDisabled()}
        />
      )}
      {openPulsarTimingBeamDialog && (
        <AlertDialog
          open={openPulsarTimingBeamDialog}
          onClose={closeDialog}
          onDialogResponse={addPulsarTimingBeamsConfirmed}
          title="pulsarTimingBeam.title"
        >
          {alertPulsarTimingBeamsContent()}
        </AlertDialog>
      )}
    </div>
  );
}
