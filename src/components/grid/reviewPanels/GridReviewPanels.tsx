import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid2 } from '@mui/material';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { Panel } from '@/utils/types/panel';
import GetPanelList from '@/services/axios/getPanelList/getPanelList';

interface GridReviewPanelsProps {
  height?: string;
  listOnly?: boolean;
  onRowClick?: (row: any) => void;
  updatedData: Panel | null;
}

export default function GridReviewPanels({
  height = '50vh',
  listOnly = false,
  onRowClick,
  updatedData
}: GridReviewPanelsProps) {
  const { t } = useTranslation('pht');

  const [data, setData] = React.useState<Panel[]>([]);
  const [fetchList, setFetchList] = React.useState(false);
  const [, setAxiosError] = React.useState('');

  const GetReviewPanels = async () => {
    // NotifyWarning(t('addProposal.warning'));
    const response = await GetPanelList();
    if (typeof response === 'string') {
      setAxiosError(response);
    } else {
      return response;
    }
  };

  const updateReviewPanel = (updatedData: Panel) => {
    setData(prevData => prevData.map(item => (item?.id === updatedData?.id ? updatedData : item)));
  };

  React.useEffect(() => {
    if (updatedData) {
      updateReviewPanel(updatedData);
    }
  }, [updatedData]);

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetReviewPanels();
      if (response) {
        setData((response as unknown) as Panel[]);
      }
    };
    fetchData();
  }, [fetchList]);

  const colTitle = {
    field: 'title',
    headerName: t('panels.name'),
    flex: 2,
    minWidth: 250,
    renderCell: (e: any) => e.row.name
  };

  const stdColumns = [...[colTitle]];

  const ProposalsSectionTitle = () => (
    <Typography align="center" variant="h6" minHeight="4vh" textAlign={'left'}>
      {t('proposals.label')}
    </Typography>
  );

  return (
    <>
      {!listOnly && <Grid2>{ProposalsSectionTitle()}</Grid2>}

      <Grid2 pt={1}>
        {false && (!data || data.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('page.15.empty')} testId="helpPanelId" />
        )}
        {true && data.length > 0 && (
          <div>
            <DataGrid
              maxHeight={height}
              testId="dataGridId"
              rows={data}
              columns={stdColumns}
              height={height}
              onRowClick={(e: any) => {
                onRowClick?.(e.row);
              }}
            />
          </div>
        )}
      </Grid2>
    </>
  );
}
