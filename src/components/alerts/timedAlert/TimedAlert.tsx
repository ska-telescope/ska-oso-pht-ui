import * as React from 'react';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardAlert from '../standardAlert/StandardAlert';
import { useNotify } from '@/utils/notify/useNotify';

const SECS = 2000;

interface TimedAlertProps {
  color: typeof AlertColorTypes;
  delay?: number;
  testId: string;
  text: string;
}

export default function TimedAlert({ color, delay = 2, testId, text }: TimedAlertProps) {
  const [show, setShow] = React.useState(false);
  const { notifyClear } = useNotify();

  const closeFunction = () => {
    notifyClear();
    setShow(false);
  };

  React.useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        closeFunction();
      }, delay * SECS);
    };

    setShow(true);
    if (color === AlertColorTypes.Info || color === AlertColorTypes.Success) {
      timer();
    }
  }, []);
  return (
    <>
      {show && (
        <StandardAlert color={color} testId={testId} text={text} closeFunc={closeFunction} />
      )}
    </>
  );
}
