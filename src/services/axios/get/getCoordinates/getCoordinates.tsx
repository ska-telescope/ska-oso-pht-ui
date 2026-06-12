import { SKA_OSO_SERVICES_URL, USE_LOCAL_DATA } from '@utils/constants.ts';
import axiosClient from '../../axiosClient/axiosClient.tsx';

const MOCK_UNITS = ['equatorial', 'galactic'];

async function GetCoordinates(targetName: string, skyUnits: number) {
  const units = skyUnits < 0 || skyUnits > MOCK_UNITS.length - 1 ? 0 : skyUnits;

  try {
    const URL_PATH = `/coordinates/`;
    /* This is a rare case where the OSO-services endpoint is open to the public */
    const result = await axiosClient.get(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}${targetName}/${MOCK_UNITS[units]}`
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCoordinates;
