import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { IMAGE_WEIGHTING, STATUS_OK } from '../../utils/constants';
import { validateSDPPage } from '../../utils/proposalValidation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import AddButton from '../../components/button/Add/Add';
import EditIcon from '../../components/icon/editIcon/editIcon';
import TrashIcon from '../../components/icon/trashIcon/trashIcon';
import Alert from '../..//components/alerts/standardAlert/StandardAlert';
import AlertDialog from '../../components/alerts/alertDialog/AlertDialog';
import FieldWrapper from '../../components/wrappers/fieldWrapper/FieldWrapper';
import { PATH } from '../../utils/constants';
import { DataProductSDP } from '../../utils/types/dataProduct';
import Observation from '../../utils/types/observation';
import { presentUnits } from '../../utils/present';

const PAGE = 7;
const DATA_GRID_HEIGHT = 450;
const LABEL_WIDTH = 6;

export default function SdpDataPage() {
  const { t } = useTranslation('pht');

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currentRow, setCurrentRow] = React.useState(0);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [baseObservations, setBaseObservations] = React.useState([]);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState()?.length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    const results: Observation[] = getProposal()?.observations?.filter(
      ob =>
        typeof getProposal()?.targetObservation.find(
          e => e.observationId === ob.id && e.sensCalc.statusGUI === STATUS_OK
        ) !== 'undefined'
    );
    const values = results?.map(e => ({ label: e.id, value: e.id }));
    if (values) {
      setBaseObservations([...values]);
    }
    setValidateToggle(!validateToggle);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateSDPPage(getProposal()));
  }, [validateToggle]);

  const getODPString = inArr => {
    let str = '';
    for (let i = 0; i < inArr?.length; i++) {
      if (inArr[i]) {
        if (str?.length > 0) {
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
        field: 'observationId',
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
          <Box pt={2}>
            <Tooltip
              data-testid="odp-values"
              title={getODPString(e.row.observatoryDataProduct)}
              arrow
            >
              <Typography>{getODPString(e.row.observatoryDataProduct)}</Typography>
            </Tooltip>
          </Box>
        )
      },
      {
        field: 'imageSize',
        headerName: t('imageSize.label'),
        flex: 0.5,
        disableClickEventBubbling: true,
        renderCell: (e: { row: DataProductSDP }) =>
          e.row.imageSizeValue + ' ' + presentUnits(e.row.imageSizeUnits)
      },
      {
        field: 'pixelSize',
        headerName: t('pixelSize.label'),
        flex: 0.5,
        disableClickEventBubbling: true,
        renderCell: (e: { row: DataProductSDP }) =>
          e.row.pixelSizeValue + ' ' + presentUnits(e.row.pixelSizeUnits)
      },
      {
        field: 'weighting',
        headerName: t('imageWeighting.label'),
        flex: 1,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { weighting: number } }) => {
          return IMAGE_WEIGHTING[e.row.weighting]?.label;
        }
      },
      {
        field: 'actions',
        type: 'actions',
        sortable: false,
        flex: 0.5,
        disableClickEventBubbling: true,
        renderCell: (e: { row: { id: number } }) => (
          <>
            <EditIcon
              onClick={editIconClicked}
              disabled
              toolTip="This feature is currently disabled"
            />
            <TrashIcon onClick={deleteIconClicked} toolTip={t(`deleteDataProduct.label`)} />
          </>
        )
      }
    ]
  ];

  const editIconClicked = async () => {
    // TODO
  };

  const deleteIconClicked = () => {
    setOpenDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = getProposal().dataProductSDP.filter(e => e.id !== currentRow);

    setProposal({ ...getProposal(), dataProductSDP: obs1 });
    setCurrentRow(0);
    closeDeleteDialog();
  };

  const alertContent = () => {
    const rec = getProposal().dataProductSDP.find(p => p.id === currentRow);
    return (
      <Grid
        p={2}
        container
        direction="column"
        alignItems="space-evenly"
        justifyContent="space-around"
      >
        <FieldWrapper label={t('observations.dp.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.observationId}</Typography>
          <Typography variant="body1">{rec.observationId}</Typography>
        </FieldWrapper>
        <FieldWrapper label={t('observatoryDataProduct.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {t(`observatoryDataProduct.options.${rec.observatoryDataProduct}`)}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('imageSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {rec.imageSizeValue} {rec.imageSizeUnits}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('pixelSize.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">
            {rec.pixelSizeValue} {rec.pixelSizeUnits}
          </Typography>
        </FieldWrapper>
        <FieldWrapper label={t('weighting.label')} labelWidth={LABEL_WIDTH}>
          <Typography variant="body1">{rec.weighting}</Typography>
        </FieldWrapper>
      </Grid>
    );
  };

  const hasObservations = () => (baseObservations?.length > 0 ? true : false);
  const getRows = () => getProposal().dataProductSDP;
  const errorSuffix = () => (hasObservations() ? '.noProducts' : '.noObservations');

  const clickRow = (e: { id: number }) => {
    setCurrentRow(e.id);
  };

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" alignItems="flex-start" justifyContent="space-around">
        <Grid item xs={10}>
          <AddButton
            title="dataProduct.button"
            action={PATH[3]}
            disabled={!hasObservations()}
            testId="addDataProductButton"
          />
          {getRows()?.length > 0 && (
            <DataGrid
              rows={getRows()}
              columns={extendedColumnsObservations}
              height={DATA_GRID_HEIGHT}
              onRowClick={clickRow}
              testId="observationDetails"
            />
          )}
          {(!getRows() || getRows().length === 0) && (
            <Alert
              color={AlertColorTypes.Error}
              text={t('page.' + PAGE + errorSuffix())}
              testId="noDataProductsNotification"
            />
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
