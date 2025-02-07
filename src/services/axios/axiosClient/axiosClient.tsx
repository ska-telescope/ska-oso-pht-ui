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
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export default axiosClient;
