import React from 'react';
import { Radio, FormControlLabel, Grid } from '@mui/material';
import { DataGrid } from '@ska-telescope/ska-gui-components';
import { RA_TYPE_ICRS } from '@utils/constants.ts';
import AddButton from '@components/button/Add/Add.tsx';
import AlertDialog from '@components/alerts/alertDialog/AlertDialog.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function PulsarTimingBeamField() {
  const { t } = useScopedTranslation();
  const [selectedValue, setSelectedValue] = React.useState('noBeam');
  const [showGrid, setShowGrid] = React.useState(false);
  const [openPulsarTimingBeamDialog, setOpenPulsarTimingBeamDialog] = React.useState(false);

  const handleClick = event => {
    setSelectedValue(event.target.value);
  };

  React.useEffect(() => {
    setShowGrid(selectedValue === 'multipleBeams');
  }, [selectedValue]);

  const controlProps = item => ({
    checked: selectedValue === item,
    onClick: handleClick,
    value: item,
    name: 'radio-group',
    inputProps: { 'aria-label': item }
  });

  const columns = [
    { field: 'name', headerName: t('name.label'), flex: 2 },
    { field: 'raStr', headerName: t('skyDirection.short.1.' + RA_TYPE_ICRS.value), width: 120 },
    { field: 'decStr', headerName: t('skyDirection.short.2.' + RA_TYPE_ICRS.value), width: 120 },
    //TODO: Resolve action button
    {
      field: 'actions',
      headerName: t('actions.label'),
      renderCell: () => (
        <AddButton
          action={() => setOpenPulsarTimingBeamDialog(true)}
          testId={'addPulsarTimingBeamButton'}
          title={'pulsarTimingBeam.add'}
          toolTip={'pulsarTimingBeam.toolTip'}
        />
      )
    }
  ];

  const closeDialog = () => {
    setOpenPulsarTimingBeamDialog(false);
  };

  const addPulsarTimingBeamsConfirmed = () => {
    closeDialog();
  };

  const alertPulsarTimingBeamsContent = () => {
    return (
      <Grid container direction="column" alignItems="center" justifyContent="space-around">
        {/*<Grid>{nameField()}</Grid>*/}
        {/*<Grid>{skyDirection1Field()}</Grid>*/}
        {/*<Grid>{skyDirection2Field()}</Grid>*/}
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
          <DataGrid columns={getColumns()} height={171} testId="pulsarTimingBeamColumns" />
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
