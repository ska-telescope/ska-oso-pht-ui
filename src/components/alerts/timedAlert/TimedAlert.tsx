import * as React from 'react';
import { Typography } from '@mui/material';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';

const SECS = 1000;

interface TimedAlertProps {
  clear?: Function;
  color: AlertColorTypes;
  delay?: number;
  text: string;
}

export default function TimedAlert({ clear, color, delay = 2, text }: TimedAlertProps) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const setClear = () => {
      if (typeof clear === 'function') {
        clear('');
      }
    };

    const timer = () => {
      setTimeout(() => {
        setClear();
        setShow(false);
      }, delay * SECS);
    };

    setShow(true);
    timer();
  }, []);

  return (
    <>
      {show && (
        <Alert testId="timedAlertId" color={color}>
          <Typography>{text}</Typography>
        </Alert>
      )}
    </>
  );
}
