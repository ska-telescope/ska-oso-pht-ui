import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { OBSERVATION, STATUS_ERROR, STATUS_OK } from '../../utils/constants';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import { DataGrid } from '@ska-telescope/ska-gui-components';
import AddButton from '../../components/button/Add/Add';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import ErrorPanel from '../../components/info/errorPanel/errorPanel';
import { PATH } from '../../utils/constants';

const PAGE = 7;
const DATAGRID_HEIGHT = 450;
const LABEL_WIDTH = 6;

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
    const count = getProposal().dataProducts?.length > 0 ? 1 : 0;
    setTheProposalState(result[count]);
  }, [validateToggle]);

  const getODPString = inArr => {
    let str = '';
    for (let i = 0; i < inArr.length; i++) {
      if (inArr[i]) {
        if (str.length > 0) {
          str += ', ';
        }
        const res = i + 1;
        const tmp = t('observatoryDataProduct.options.' + res);
        str += tmp;
      }
    }
    return str;
  };

  const extendedColumnsObservations = [
    ...[
      {
        field: 'observations',
        headerName: t('observations.dp.label'),
        flex: 0.5,
        disableClickEventBubbling: true
      },
      {
        field: 'observatoryDataProduct',
        headerName: t('observatoryDataProduct.label'),
        flex: 2,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { observatoryDataProduct: number } }) => (
          <Tooltip
            data-testid="odp-values"
            title={getODPString(e.row.observatoryDataProduct)}
            arrow
          >
            <Typography>{getODPString(e.row.observatoryDataProduct)}</Typography>
          </Tooltip>
        )
      },
      {
        field: 'imageSize',
        headerName: t('imageSize.label'),
        flex: 0.5,
        disableClickEventBubbling: true
      },
      {
        field: 'pixelSize',
        headerName: t('pixelSize.label'),
        flex: 0.5,
        disableClickEventBubbling: true
      },
      {
        field: 'weighting',
        headerName: t('imageWeighting.label'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { weighting: number } }) => {
          return OBSERVATION.ImageWeighting[e.row.weighting].label;
        }
      },
      {
        field: 'id',
        headerName: t('actions.label'),
        sortable: false,
        flex: 0.5,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: number } }) => (
          <TrashIcon onClick={deleteIconClicked} toolTip={t(`deleteDataProduct.label`)} />
        )
      }
    ]
  ];

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
    const rec = getProposal().dataProducts.find(p => p.id === currentRow);
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('observations.dp.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.observations}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('observatoryDataProduct.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {t(`observatoryDataProduct.options.${rec.observatoryDataProduct}`)}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('imageSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.imageSize}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('pixelSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.pixelSize}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('weighting.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.weighting}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const hasObservations = () => (getProposal()?.targetObservation?.length > 0 ? true : false);
  const getRows = () => getProposal().dataProducts;
  const errorSuffix = () => (hasObservations() ? '.noProducts' : '.noObservations');
  const errorMessage = () => 'page.' + PAGE + errorSuffix();

  const clickRow = (e: { id: number }) => {
    setCurrentRow(e.id);
  };

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="flex-start" justifyContent="space-around">
        <Grid item xs={10}>
          <AddButton title="dataProduct.button" action={PATH[3]} disabled={!hasObservations()} />
          {getRows().length > 0 && (
            <DataGrid
              rows={getRows()}
              columns={extendedColumnsObservations}
              height={DATAGRID_HEIGHT}
              onRowClick={clickRow}
              testId="observationDetails"
            />
          )}
          {getRows().length === 0 && (
            <Box pt={2}>
              <ErrorPanel msg={errorMessage()} />
            </Box>
          )}
        </Grid>
      </Grid>

      {openDialog && (
        <AlertDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onDialogResponse={deleteConfirmed}
          title="deleteDataProduct.confirmTitle"
        >
          {alertContent()}
        </AlertDialog>
      )}
    </Shell>
  );
}
