import { storageObject } from '@utils/storage/store';
import { useState, useEffect } from 'react';
import ObservatoryData from '@/utils/types/observatoryData';
import { getCycles } from '@/services/api/osd';

export const useOSDAPI = (setAxiosError: (error: string) => void, enabled: boolean) => {
  const { application, updateAppContent3 } = storageObject.useStore();

  const [osdData, setOsdData] = useState<ObservatoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const isObservatoryData = (data: any): data is ObservatoryData => {
    return (
      data && typeof data === 'object' && Array.isArray(data.policies) && 'capabilities' in data
    );
  };

  useEffect(() => {
    const currentData = application.content3;
    if (isObservatoryData(currentData)) {
      setOsdData(currentData);
      setLoading(false);
      return;
    }

    // Wait for auth to settle: fetching too early races the login redirect and
    // never retries, leaving this stuck unset. See caller for the enabled condition.
    if (!enabled) return;

    const fetchObservatoryData = async () => {
      try {
        const { data, error } = await getCycles();
        if (error) {
          setAxiosError(error);
        } else if (isObservatoryData(data)) {
          updateAppContent3(data);
          setOsdData(data);
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
  }, [enabled]);

  return { osdData, loading };
};
