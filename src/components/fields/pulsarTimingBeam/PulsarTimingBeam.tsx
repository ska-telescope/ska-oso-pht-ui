import React from 'react';
import { Radio, FormControlLabel, Grid, Box } from '@mui/material';
import { DataGrid, TextEntry } from '@ska-telescope/ska-gui-components';
import { LAB_POSITION, RA_TYPE_ICRS } from '@utils/constants.ts';
import AddButton from '@components/button/Add/Add.tsx';
import AlertDialog from '@components/alerts/alertDialog/AlertDialog.tsx';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Target, { Beam, ReferenceCoordinateICRS, TiedArrayBeams } from '@utils/types/target.tsx';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
import ResolveButton from '@components/button/Resolve/Resolve.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';

interface PulsarTimingBeamFieldProps {
  target?: Target;
  onDialogResponse?: Function;
  resetBeamData?: boolean;
  showBeamData?: boolean;
}

interface Row {
  beamId?: number;
  beamName?: string;
  beamCoordinate?: {
    kind: number;
    referenceFrame: string;
    raStr: string;
    decStr: string;
  };
  stnWeights?: number[];
}
export default function PulsarTimingBeamField({
  target,
  onDialogResponse,
  resetBeamData,
  showBeamData = false
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
  const [rows, setRows] = React.useState<Row[]>([]);
  const [allBeams, setAllBeams] = React.useState<Beam[]>([]);
  const LAB_WIDTH = 5;

  React.useEffect(() => {
    if (selectedValue === 'noBeam') {
      setRows([]); // Reset rows to initial state
      setAllBeams([]); // Clear tiedArrayBeam data
    }
  }, [selectedValue]);

  React.useEffect(() => {
    console.log('/////// allBeams', allBeams);
  }, [setAllBeams]);

  React.useEffect(() => {
    if (onDialogResponse) {
      onDialogResponse(allBeams); // Trigger callback after state update
    }
  }, [allBeams]);

  React.useEffect(() => {
    if (showBeamData) {
      if (target && target.tiedArrayBeams) {
        // Generate updatedRows
        // const updatedRows = target.tiedArrayBeams.flatMap(beamGroup =>
        //   beamGroup.pstBeams.map(beam => ({
        //     id: beam.beamId, // Use beamId as the unique identifier
        //     beamId: beam.beamId,
        //     name: beam.beamName,
        //     raStr: beam.beamCoordinate.raStr,
        //     decStr: beam.beamCoordinate.decStr,
        //     isAddRow: false
        //   }))
        // );

        const updatedRows = target.tiedArrayBeams.pstBeams.map((beam: Beam) => ({
            id: beam.beamId,
            beamId: beam.beamId,
            name: beam.beamName,
            raStr: (beam.beamCoordinate as ReferenceCoordinateICRS).raStr,
            decStr: (beam.beamCoordinate as ReferenceCoordinateICRS).decStr,
            isAddRow: false
          }));

        // Combine rows, and updatedRows, ensuring no duplicates
        const uniqueRows = updatedRows.filter(
          (updatedRow, index, self) => index === self.findIndex(row => row.id === updatedRow.id)
        );
        setRows(uniqueRows);

        // // Extract tiedArrayBeams data and update setAllBeams
        // const extractedBeams = target.tiedArrayBeams.map(beamGroup => ({
        //   ...beamGroup,
        //   pstBeams: beamGroup.pstBeams.map(beam => ({
        //     beamId: beam.beamId,
        //     beamName: beam.beamName,
        //     beamCoordinate: beam.beamCoordinate,
        //     stnWeights: beam.stnWeights
        //   }))
        // }));
        // setAllBeams(extractedBeams);
        // Extract tiedArrayBeams data and update setAllBeams
        const extractedBeams = target.tiedArrayBeams.pstBeams.map(pstBeam => ({
            beamId: pstBeam.beamId,
            beamName: pstBeam.beamName,
            beamCoordinate: pstBeam.beamCoordinate,
            stnWeights: pstBeam.stnWeights
          }));
        setAllBeams(extractedBeams);
      }
      setSelectedValue('multipleBeams');
      setShowGrid(true);
    }
  }, [showBeamData]);

  React.useEffect(() => {
    if (resetBeamData) {
      setRows([]);
      setBeamDec('');
      setBeamRA('');
      setBeamName('');
      setAllBeams([]);
    }
  }, [resetBeamData]);

  const wrapper = (children: any) => <Box sx={{ width: '100%' }}>{children}</Box>;

  const handleClick = event => {
    setSelectedValue(event.target.value);
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

  const controlProps = item => ({
    checked: selectedValue === item,
    onClick: handleClick,
    value: item,
    name: 'radio-group',
    inputProps: { 'aria-label': item }
  });

  const columns = [
    { field: 'name', headerName: t('name.label'), flex: 1.5 },
    { field: 'raStr', headerName: t('skyDirection.short.1.' + RA_TYPE_ICRS.value), width: 120 },
    { field: 'decStr', headerName: t('skyDirection.short.2.' + RA_TYPE_ICRS.value), width: 120 }
  ];

  const closeDialog = () => {
    setOpenPulsarTimingBeamDialog(false);
  };

  const addPulsarTimingBeamsConfirmed = () => {
    if (beamName && beamRA && beamDec) {
      const newRow = {
        id: Math.floor(Math.random() * 100), // TODO improve id generation
        name: beamName,
        raStr: beamRA,
        decStr: beamDec
      };
      setRows(prevRows => [...prevRows, newRow]);
      setBeamName('');
      setBeamRA('');
      setBeamDec('');
    }

    const newBeam: Beam = {
      beamId: Math.floor(Math.random() * 100), // TODO improve id generation
      beamName: beamName,
      beamCoordinate: {
        kind: RA_TYPE_ICRS.label,
        referenceFrame: RA_TYPE_ICRS.label,
        raStr: beamRA,
        decStr: beamDec
      },
      stnWeights: [1]
    };

    const newTiedArrayBeams: TiedArrayBeams = {
      pssBeams: [],
      pstBeams: [newBeam],
      vlbiBeams: []
    };

    console.log('----------- newTiedArrayBeams', newTiedArrayBeams);

    // setAllBeams(prevBeams => {
    //   const updatedBeams = [...prevBeams];
    //   if (updatedBeams.length > 0) {
    //     const lastBeamGroup = updatedBeams[updatedBeams.length - 1];
    //     const isDuplicate = lastBeamGroup.pstBeams.some(beam => beam.beamName === newBeam.beamName);
    //     if (!isDuplicate) {
    //       lastBeamGroup.push(newBeam);
    //     }
    //   } else {
    //     updatedBeams.push(newBeam);
    //   }
    //   return updatedBeams;
    // });
    setAllBeams(prevBeams => {
      const updatedBeams = [...prevBeams];
      updatedBeams.push(newBeam);
      return updatedBeams;
    });

    closeDialog();
    setShowGrid(selectedValue === 'multipleBeams');
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

  const getColumns = () => columns;

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
      {showGrid && (
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={getColumns()}
            height={rows.length * 60 + 100}
            testId="pulsarTimingBeamColumns"
          />
        </div>
      )}

      {selectedValue === 'multipleBeams' && (
        <AddButton
          action={() => setOpenPulsarTimingBeamDialog(true)}
          testId={'addPulsarTimingBeamButton'}
          toolTip={'pulsarTimingBeam.toolTip'}
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
