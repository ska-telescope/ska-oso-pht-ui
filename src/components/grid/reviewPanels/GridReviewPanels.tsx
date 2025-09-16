import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid } from '@mui/material';
import GetPanelList from '@services/axios/get/getPanelList/getPanelList';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { Panel } from '@/utils/types/panel';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import PostPanelGenerate from '@/services/axios/post/postPanelGenerate/postPanelGenerate';
import ObservatoryData from '@/utils/types/observatoryData';

interface GridReviewPanelsProps {
  height?: string;
  listOnly?: boolean;
  onRowClick: (row: any) => void;
  // updatedData: Panel | null;
}

export default function GridReviewPanels({
  height = '50vh',
  listOnly = false,
  onRowClick
}: GridReviewPanelsProps) {
  const { t } = useTranslation('pht');
  const authClient = useAxiosAuthClient();
  const { application } = storageObject.useStore();

  const [data, setData] = React.useState<Panel[]>([]);
  const [createList, setCreateList] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const [, setAxiosError] = React.useState('');

  const GetReviewPanels = async () => {
    const response = await GetPanelList(authClient);
    if (typeof response === 'string') {
      setAxiosError(response);
    } else {
      return response;
    }
  };

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const getObservatoryData = () => application.content3 as ObservatoryData;
    const autoGeneratePanels = async (osd: ObservatoryData) => {
      await PostPanelGenerate(authClient, osd?.observatoryPolicy?.cycleDescription);
      setFetchList(!fetchList);
    };
    if (createList) {
      autoGeneratePanels(getObservatoryData());
    }
  }, [createList]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetReviewPanels();
      if (response) {
        const panels = (response as unknown) as Panel[];
        if (panels?.length > 0) {
          setData(panels);
        } else {
          setCreateList(!createList);
        }
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

  function filteredData(panels: Panel[]): Panel[] {
    return [...panels].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <>
      {!listOnly && <Grid>{ProposalsSectionTitle()}</Grid>}

      <Grid pt={1}>
        {(!data || data.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('page.15.empty')} testId="helpPanelId" />
        )}
        {data.length > 0 && (
          <>
            <DataGrid
              maxHeight={`calc(${height} - 50px)`}
              testId="dataGridId"
              rows={filteredData(data)}
              columns={stdColumns}
              height={`calc(${height} - 50px)`}
              onRowClick={(e: any) => onRowClick(e.row)}
            />
          </>
        )}
      </Grid>
    </>
  );
}
