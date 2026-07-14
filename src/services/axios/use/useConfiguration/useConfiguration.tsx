import { useEffect, useState } from 'react';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient';
import Configuration from '@/utils/types/configuration';
import GetConfiguration from '../../get/getConfiguration/getConfiguration';

// configuration stays null if the fetch fails - callers should treat that as "the
// coarse-channel constraint isn't available yet" and fall back to their existing behaviour.
export const useConfiguration = () => {
  const authClient = useAxiosAuthClient();
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfiguration = async () => {
      try {
        const response = await GetConfiguration(authClient);
        if (typeof response !== 'string') {
          setConfiguration(response);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguration();
  }, []);

  return { configuration, loading };
};
