import { SKA_OSO_SERVICES_URL} from '@utils/constants.ts';
import axiosClient from '../../axiosClient/axiosClient.tsx';

const UNITS = ['equatorial', 'galactic'];

async function GetCoordinates(targetName: string, skyUnits: number) {
  const units = skyUnits < 0 || skyUnits > UNITS.length - 1 ? 0 : skyUnits;

  try {
    const URL_PATH = `/coordinates/`;
    /* This is a rare case where the OSO-services endpoint is open to the public */
    const result = await axiosClient.get(
      `${SKA_OSO_SERVICES_URL}${URL_PATH}${targetName}/${UNITS[units]}`
    );
    return typeof result === 'undefined'
  ? { error: 'error.API_UNKNOWN_ERROR' }
  : result.data;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
    return { error: 'error.API_UNKNOWN_ERROR' };
  }
}

export default GetCoordinates;
