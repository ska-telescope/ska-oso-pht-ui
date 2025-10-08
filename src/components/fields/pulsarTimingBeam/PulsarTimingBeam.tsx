import React from 'react';
import { Radio, FormControlLabel, Grid, Box } from '@mui/material';
import { DataGrid, TextEntry } from '@ska-telescope/ska-gui-components';
import { LAB_POSITION, RA_TYPE_ICRS } from '@utils/constants.ts';
import AddButton from '@components/button/Add/Add.tsx';
import AlertDialog from '@components/alerts/alertDialog/AlertDialog.tsx';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Target, { Beam, TiedArrayBeams } from '@utils/types/target.tsx';
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
  id: number;
  isAddRow: boolean;
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
  showBeamData
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
  const initialRows = [{ id: 1, isAddRow: true }];
  const [rows, setRows] = React.useState<Row[]>([{ id: 1, isAddRow: true }]);
  const [allBeams, setAllBeams] = React.useState<TiedArrayBeams[]>([]);
  const LAB_WIDTH = 5;

  React.useEffect(() => {
    setShowGrid(selectedValue === 'multipleBeams');
  }, [selectedValue]);

  React.useEffect(() => {
    if (onDialogResponse) {
      onDialogResponse(allBeams); // Trigger callback after state update
    }
  }, [allBeams, onDialogResponse]);

  React.useEffect(() => {
    if (showBeamData) {
      console.log('PST BEAM target ', target);

      if (target && target.tiedArrayBeams) {
        console.log('beams', target.tiedArrayBeams);

        // Generate updatedRows
        const updatedRows = target.tiedArrayBeams.flatMap(beamGroup =>
          beamGroup.pstBeams.map(beam => ({
            id: beam.beamId + 1, // Use beamId as the unique identifier
            beamId: beam.beamId,
            name: beam.beamName,
            raStr: beam.beamCoordinate.raStr,
            decStr: beam.beamCoordinate.decStr,
            isAddRow: false,
          }))
        );

        console.log('updatedRows: ', updatedRows);

        // Combine initialRows, rows, and updatedRows, ensuring no duplicates
        const uniqueRows = [
          ...initialRows.filter(
            initialRow =>
              !rows.some(existingRow => existingRow.id === initialRow.id) &&
              !updatedRows.some(updatedRow => updatedRow.id === initialRow.id)
          ),
          ...rows.filter(
            existingRow => !updatedRows.some(updatedRow => updatedRow.id === existingRow.id)
          ),
          ...updatedRows,
        ];

        console.log('uniqueRows: ', uniqueRows);
        setRows(uniqueRows);

        // Extract tiedArrayBeams data and update setAllBeams
        const extractedBeams = target.tiedArrayBeams.map(beamGroup => ({
          ...beamGroup,
          pstBeams: beamGroup.pstBeams.map(beam => ({
            beamId: beam.beamId,
            beamName: beam.beamName,
            beamCoordinate: beam.beamCoordinate,
            stnWeights: beam.stnWeights,
          })),
        }));
        console.log('extractedBeams', extractedBeams);
        setAllBeams(extractedBeams);
      }
      setSelectedValue('multipleBeams');
      setShowGrid(true);
    }
  }, [showBeamData]);

  React.useEffect(() => {
    if (resetBeamData) {
      setInitialRows(); // Reset rows to initial state
      setBeamDec('');
      setBeamRA('');
      setBeamName('');
      setAllBeams([]);
    }
  }, [resetBeamData]);

  const wrapper = (children: any) => <Box sx={{ width: '100%' }}>{children}</Box>;

  const setInitialRows = () => {
    setRows(initialRows);
  };

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
    { field: 'decStr', headerName: t('skyDirection.short.2.' + RA_TYPE_ICRS.value), width: 120 },
    {
      field: 'actions',
      headerName: t('actions.label'),
      renderCell: params => {
        if (params.row.isAddRow) {
          return (
            <AddButton
              action={() => setOpenPulsarTimingBeamDialog(true)}
              testId={'addPulsarTimingBeamButton'}
              toolTip={'pulsarTimingBeam.toolTip'}
            />
          );
        }
        return params.value;
      }
    }
  ];

  const closeDialog = () => {
    setOpenPulsarTimingBeamDialog(false);
  };

  const addPulsarTimingBeamsConfirmed = () => {
    if (beamName && beamRA && beamDec) {
      const newRow = {
        id: rows.length + 1, // Unique ID for the new row
        name: beamName,
        raStr: beamRA,
        decStr: beamDec,
        isAddRow: false
      };
      setRows(prevRows => [...prevRows, newRow]);
      setBeamName('');
      setBeamRA('');
      setBeamDec('');
    }

    const newBeam: Beam = {
      beamId: rows.length,
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

    setAllBeams(prevBeams => {
      const updatedBeams = [...prevBeams];
      if (updatedBeams.length > 0) {
        const lastBeamGroup = updatedBeams[updatedBeams.length - 1];
        const isDuplicate = lastBeamGroup.pstBeams.some(beam => beam.beamName === newBeam.beamName);
        if (!isDuplicate) {
          lastBeamGroup.pstBeams.push(newBeam);
        }
      } else {
        updatedBeams.push(newTiedArrayBeams);
      }
      return updatedBeams;
    });

    closeDialog();
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
        <div style={{ height: 300, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={getColumns()}
            height={rows.length * 60 + 100} // 40px per row + 71px for header
            testId="pulsarTimingBeamColumns"
          />
        </div>
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
