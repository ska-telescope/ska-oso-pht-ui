import axios from 'axios';

export enum LogLevel {
  Error,
  Warning,
  Info,
  Verbose,
  Trace
}

const axiosClient = axios.create({
  headers: {
    Accept: 'application/pdf',
    'Content-Type': 'application/pdf'
  }
});

export default axiosClient;
