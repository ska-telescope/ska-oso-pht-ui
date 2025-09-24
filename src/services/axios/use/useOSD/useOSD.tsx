import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useState, useEffect } from 'react';
import { OBSERVATION } from '@utils/observationConstantData.ts';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import GetObservatoryData from '../../get/getObservatoryData/getObservatoryData';
import ObservatoryData from '@/utils/types/observatoryData';

export const useOSD = (setAxiosError: (error: string) => void) => {
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
        const response = await GetObservatoryData(authClient, 1);
        if (typeof response === 'string' || (response && (response as any).error)) {
          setAxiosError(response.toString());
        } else if (isObservatoryData(response)) {
          //TODO: Update osd with constantData
          const combined = {
            constantData: OBSERVATION,
            osdData: response
          };
          updateAppContent3(combined);
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
