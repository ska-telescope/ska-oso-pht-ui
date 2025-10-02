import React from 'react';
import { Radio, FormControlLabel, Grid, Box } from '@mui/material';
import { DataGrid, TextEntry } from '@ska-telescope/ska-gui-components';
import { LAB_POSITION, RA_TYPE_ICRS } from '@utils/constants.ts';
import AddButton from '@components/button/Add/Add.tsx';
import AlertDialog from '@components/alerts/alertDialog/AlertDialog.tsx';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Target from '@utils/types/target.tsx';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates.tsx';
import ResolveButton from '@components/button/Resolve/Resolve.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';

interface PulsarTimingBeamFieldProps {
  setTarget?: Function;
  target?: Target;
}
export default function PulsarTimingBeamField({ setTarget, target }: PulsarTimingBeamFieldProps) {
  const { t } = useScopedTranslation();
  const { helpComponent } = storageObject.useStore();

  const [selectedValue, setSelectedValue] = React.useState('noBeam');
  const [showGrid, setShowGrid] = React.useState(false);
  const [openPulsarTimingBeamDialog, setOpenPulsarTimingBeamDialog] = React.useState(false);
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [beamName, setBeamName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [rows, setRows] = React.useState([{ id: 1, isAddRow: true }]);
  const LAB_WIDTH = 5;
  const wrapper = (children: any) => <Box sx={{ width: '100%' }}>{children}</Box>;

  const handleClick = event => {
    setSelectedValue(event.target.value);
  };

  React.useEffect(() => {
    setShowGrid(selectedValue === 'multipleBeams');
  }, [selectedValue]);

  const setTheName = (inValue: string) => {
    setBeamName(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, name: inValue });
    }
  };

  const setTheDec = (inValue: string) => {
    setDec(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, decStr: inValue });
    }
  };

  const setTheRA = (inValue: string) => {
    setRA(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, raStr: inValue });
    }
  };

  const controlProps = item => ({
    checked: selectedValue === item,
    onClick: handleClick,
    value: item,
    name: 'radio-group',
    inputProps: { 'aria-label': item }
  });

  const columns = [
    { field: 'name', headerName: t('name.label') },
    { field: 'raStr', headerName: t('skyDirection.short.1.' + RA_TYPE_ICRS.value), width: 120 },
    { field: 'decStr', headerName: t('skyDirection.short.2.' + RA_TYPE_ICRS.value), width: 120 },
    {
      field: 'actions',
      headerName: t('actions.label'),
      flex: 2,
      renderCell: params => {
        if (params.row.isAddRow) {
          return (
            <>
              <AddButton
                action={() => setOpenPulsarTimingBeamDialog(true)}
                testId={'addPulsarTimingBeamButton'}
                toolTip={'pulsarTimingBeam.toolTip'}
              />
              {rows.length > 1 && (
                <AddButton
                  //TODO: Update text and action
                  action={''}
                  title={'pulsarTimingBeam.submit'}
                  testId={'secondAddButton'}
                  toolTip={'Second AddButton'}
                />
              )}
            </>
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
    if (beamName && ra && dec) {
      const newRow = {
        id: rows.length + 1, // Unique ID for the new row
        name: beamName,
        raStr: ra,
        decStr: dec,
        actions: null
      };
      setRows(prevRows => [...prevRows, newRow]);
      setBeamName('');
      setRA('');
      setDec('');
      closeDialog();
    }
  };

  const resolveBeamNameButton = () => {
    const processCoordinatesResults = (response: any) => {
      if (response && !response.error) {
        const values = response.split(' ');
        // const redshift =
        //   values?.length > 2 && values[2] !== 'null'
        //     ? Number(values[2])
        //       .toExponential(2)
        //       .toString()
        //     : '';
        // const vel = values?.length > 3 && values[3] !== 'null' ? values[3] : '';
        setDec(values[0]);
        setRA(values[1]);
        // setRedshift(redshift);
        // setVel(vel);
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
        testId={'name'}
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
        value={ra}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        skyUnits={RA_TYPE_ICRS.value}
        setValue={setTheDec}
        value={dec}
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
