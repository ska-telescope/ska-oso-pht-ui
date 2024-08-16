import { AlertColorTypes } from '@ska-telescope/ska-gui-components';

type Notification = {
  level: AlertColorTypes;
  message: string;
  okRequired: boolean;
  delay?: number;
};

export default Notification;
