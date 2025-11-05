import { Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { presentUnits } from '@utils/present/present';
import EditIcon from '../../icon/editIcon/editIcon';
import TrashIcon from '../../icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { DataProductSDP } from '../../../utils/types/dataProduct';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { PAGE_SDP } from '@/utils/constants';

interface GridDataProductsProps {
  baseObservations: any[];
  deleteClicked?: Function;
  editClicked?: Function;
  height?: number;
  rowClick?: Function;
  rows?: DataProductSDP[];
}

export default function GridDataProducts({
  baseObservations,
  deleteClicked,
  editClicked,
  height = 171,
  rowClick,
  rows = []
}: GridDataProductsProps) {
  const { t } = useScopedTranslation();

  const PAGE = PAGE_SDP;
  const hasObservations = () => (baseObservations?.length > 0 ? true : false);
  const errorSuffix = () => (hasObservations() ? '.noProducts' : '.noObservations');

  const getODPString = (inArr: boolean[]) => {
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

  const colObservationId = {
    field: 'observationId',
    headerName: t('observations.dp.label'),
    flex: 0.5,
    disableClickEventBubbling: true
  };

  const colDataProduct = {
    field: 'observatoryDataProduct',
    headerName: t('observatoryDataProduct.label'),
    flex: 2,
    disableClickEventBubbling: true,
    renderCell: (e: { row: { observatoryDataProduct: boolean[] } }) => (
      <Box pt={2}>
        <Tooltip data-testid="odp-values" title={getODPString(e.row.observatoryDataProduct)} arrow>
          <Typography>{getODPString(e?.row?.observatoryDataProduct)}</Typography>
        </Tooltip>
      </Box>
    )
  };

  const colImageSize = {
    field: 'imageSize',
    headerName: t('imageSize.label'),
    flex: 0.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: DataProductSDP }) =>
      e.row.imageSizeValue + ' ' + presentUnits(t('imageSize.' + e.row.imageSizeUnits))
  };

  const colPixelSize = {
    field: 'pixelSize',
    headerName: t('pixelSize.label'),
    flex: 0.5,
    disableClickEventBubbling: true,
    renderCell: (e: { row: DataProductSDP }) =>
      `${e.row.pixelSizeValue} ${presentUnits(e.row.pixelSizeUnits)}`
  };

  const colImageWeighting = {
    field: 'weighting',
    headerName: t('imageWeighting.label'),
    flex: 1,
    disableClickEventBubbling: true,
    renderCell: (e: { row: { weighting: number } }) => {
      return t('imageWeighting.' + e.row.weighting);
    }
  };

  const colActions = {
    field: 'actions',
    headerName: t('actions.label'),
    type: 'actions',
    sortable: false,
    flex: 0.5,
    disableClickEventBubbling: true,
    renderCell: (e: any) => {
      const rec: DataProductSDP = e.row;
      return (
        <>
          {editClicked !== null && (
            <EditIcon
              onClick={() => (editClicked ? editClicked(rec) : null)}
              toolTip="This feature is currently disabled"
            />
          )}
          {deleteClicked !== null && (
            <TrashIcon
              onClick={() => (deleteClicked ? deleteClicked(rec) : null)}
              toolTip={t('deleteDataProduct.label')}
            />
          )}
        </>
      );
    }
  };

  const getColumns = () => [
    ...[colObservationId, colDataProduct, colImageSize, colPixelSize, colImageWeighting, colActions]
  ];

  return (
    <>
      {rows.length > 0 && (
        <DataGrid
          rows={rows}
          columns={getColumns()}
          height={height}
          onRowClick={rowClick}
          testId="dataProductsColumns"
        />
      )}
      {!rows ||
        (rows.length === 0 && (
          <Alert
            color={AlertColorTypes.Error}
            text={t('page.' + PAGE + errorSuffix())}
            testId="helpPanelId"
          />
        ))}
    </>
  );
}
