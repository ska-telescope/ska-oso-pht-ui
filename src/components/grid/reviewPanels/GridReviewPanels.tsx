import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataGrid, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Typography, Grid2 } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import moment from 'moment';
import GetPanelList from '@services/axios/get/getPanelList/getPanelList';
import Alert from '../../alerts/standardAlert/StandardAlert';
import { Panel } from '@/utils/types/panel';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import ObservatoryData from '@/utils/types/observatoryData';
import PutPanel from '@/services/axios/put/putPanel/putPanel';

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
}: // updatedData
GridReviewPanelsProps) {
  const { t } = useTranslation('pht');
  const authClient = useAxiosAuthClient();

  const [data, setData] = React.useState<Panel[]>([]);
  const [noPanels, setNoPanels] = React.useState(false);
  const [fetchList, setFetchList] = React.useState(false);
  const [, setAxiosError] = React.useState('');
  const { application } = storageObject.useStore();
  const getObservatoryData = () => application.content3 as ObservatoryData;

  const GetReviewPanels = async () => {
    const response = await GetPanelList(authClient);
    if (typeof response === 'string') {
      setAxiosError(response);
    } else {
      return response;
    }
  };

  //const updateReviewPanel = (updatedData: Panel) => {
  //  setData(prevData => prevData.map(item => (item?.id === updatedData?.id ? updatedData : item)));
  //};

  //React.useEffect(() => {
  //  if (updatedData) {
  //    updateReviewPanel(updatedData);
  //  }
  //}, [updatedData]);

  React.useEffect(() => {
    setFetchList(!fetchList);
  }, []);

  React.useEffect(() => {
    const getDateFormatted = () => moment().format('YYYY-MM-DD');

    const getPanel = (): Panel => {
      return {
        id:
          'panel-t0001-' +
          getDateFormatted() +
          '-00001-' +
          Math.floor(Math.random() * 10000000).toString(),
        name: 'Science Verification',
        expiresOn: getDateFormatted(),
        proposals: [],
        sciReviewers: [],
        tecReviewers: []
      };
    };

    const createPanel = async () => {
      const response: string | { error: string } = await PutPanel(
        authClient,
        getPanel(),
        getObservatoryData()?.observatoryPolicy?.cycleInformation?.cycleId
      );
      if (typeof response === 'object' && response?.error) {
        setAxiosError(response.error);
      } else {
        setFetchList(!fetchList);
      }
    };
    if (noPanels) createPanel();
  }, [noPanels]);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await GetReviewPanels();
      if (response) {
        const panels = (response as unknown) as Panel[];
        if (panels?.length > 0) {
          setData(panels);
        } else {
          setNoPanels(true);
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

  return (
    <>
      {!listOnly && <Grid2>{ProposalsSectionTitle()}</Grid2>}

      <Grid2 pt={1}>
        {(!data || data.length === 0) && (
          <Alert color={AlertColorTypes.Info} text={t('page.15.empty')} testId="helpPanelId" />
        )}
        {data.length > 0 && (
          <>
            <DataGrid
              maxHeight={`calc(${height} - 50px)`}
              testId="dataGridId"
              rows={data}
              columns={stdColumns}
              height={`calc(${height} - 50px)`}
              onRowClick={(e: any) => onRowClick(e.row)}
            />
          </>
        )}
      </Grid2>
    </>
  );
}
