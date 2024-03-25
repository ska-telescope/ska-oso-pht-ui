import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { STATUS_ERROR, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import { DataGrid, InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';
import AddDataProductButton from '../../components/button/AddDataProduct/AddDataProductButton';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';

const PAGE = 7;

export default function SdpDataPage() {
  const { t } = useTranslation('pht');

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    const result = [STATUS_ERROR, STATUS_OK];
    const count = 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const columns = [
    {
      field: 'field1',
      headerName: 'FIELD 1',
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { field1: number } }) => <Typography>{e.row.field1}</Typography>
    },
    {
      field: 'field2',
      headerName: 'FIELD 2',
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { field2: number } }) => <Typography>{e.row.field2}</Typography>
    },
    {
      field: 'id',
      headerName: t('actions.label'),
      sortable: false,
      flex: 0.5,
      disableClickEventBubbling: true,
      renderCell: (e: { row: { id: number } }) => (
        <TrashIcon onClick={deleteIconClicked} toolTip="Delete data product" />
      )
    }
  ];
  const extendedColumnsObservations = [...columns];

  const deleteIconClicked = () => {
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().dataProducts.filter(e => e.id !== currentRow);

    setProposal({ ...getProposal(), dataProducts: obs1 });
    setCurrentRow(0);
    closeDeleteDialog();
  };

  const alertContent = () => {
    const LABEL_WIDTH = 6;
    const rec = getProposal().dataProducts.find(p => p.id === currentRow);
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('field1.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.field1}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('field2.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.field2}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const getRows = () => getProposal().dataProducts;

  const clickRow = (e: { id: number }) => {
    setCurrentRow(e.id);
  };

  return (
    <Shell page={PAGE}>
      <Grid container direction="column" alignItems="flex-start" justifyContent="space-around">
        <Grid container direction="row" alignItems="flex-start" justifyContent="space-between">
          <Grid item pb={1}>
            <AddDataProductButton />
          </Grid>
        </Grid>
        {getRows().length > 0 && (
          <DataGrid
            rows={getRows()}
            columns={extendedColumnsObservations}
            height={450}
            onRowClick={clickRow}
            showBorder={false}
            showMild
            testId="observationDetails"
          />
        )}
        {getRows().length === 0 && (
          <InfoCard
            color={InfoCardColorTypes.Error}
            fontSize={20}
            message={t('error.noObservations')}
            testId="helpPanelId"
          />
        )}
      </Grid>
      {openDialog && (
        <AlertDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteDataProduct.label"
        >
          {alertContent()}
        </AlertDialog>
      )}
    </Shell>
  );
}
