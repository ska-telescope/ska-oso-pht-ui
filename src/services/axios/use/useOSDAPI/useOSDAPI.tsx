import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useState, useEffect } from 'react';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import GetObservatoryData from '../../get/getObservatoryData/getObservatoryData';
import ObservatoryData from '@/utils/types/observatoryData';
import { SV_LOW_AA2_CYCLE_NUMBER } from '@/utils/constants';

export const useOSDAPI = (setAxiosError: (error: string) => void) => {
  const { application, updateAppContent3 } = storageObject.useStore();
  const authClient = useAxiosAuthClient();

  const [osdData, setOsdData] = useState<ObservatoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const isObservatoryData = (data: any): data is ObservatoryData => {
    return (
      data && typeof data === 'object' && 'observatoryPolicy' in data && 'capabilities' in data
    );
  };

  useEffect(() => {
    const currentData = application.content3;
    if (isObservatoryData(currentData)) {
      setOsdData(currentData);
      setLoading(false);
      return;
    }

    const fetchObservatoryData = async () => {
      try {
        const response = await GetObservatoryData(authClient, SV_LOW_AA2_CYCLE_NUMBER);
        if (typeof response === 'string' || (response && (response as any).error)) {
          setAxiosError(response.toString());
        } else if (isObservatoryData(response)) {
          updateAppContent3(response);
          setOsdData(response);
        } else {
          setAxiosError('Invalid observatory data format received.');
        }
      } catch (err) {
        setAxiosError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchObservatoryData();
  }, []);

  return { osdData, loading };
};
