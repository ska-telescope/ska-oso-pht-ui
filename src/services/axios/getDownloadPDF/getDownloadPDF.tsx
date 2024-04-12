import axios from 'axios';
import { AXIOS_CONFIG, SKA_PHT_API_URL } from '../../../utils/constants';

async function GetDownloadPDF(selectedFile) {
  const URL_PATH = `/download/signedurl/${selectedFile}`;

  axios
    .get(`${SKA_PHT_API_URL}${URL_PATH}`, AXIOS_CONFIG)
    .then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'chloeTest2.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch(error => {
      console.error('Error downloading file:', error);
    });
}

export default GetDownloadPDF;
