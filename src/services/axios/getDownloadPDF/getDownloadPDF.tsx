import axios from 'axios';
import { AXIOS_CONFIG } from '../../../utils/constants';

async function GetDownloadPDF(urlPath, selectedFile) {
  const URL_PATH = urlPath;

  axios
    .get(`${URL_PATH}`, AXIOS_CONFIG)
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFile);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(error => {
      console.error('Error downloading file:', error);
    });
}

export default GetDownloadPDF;