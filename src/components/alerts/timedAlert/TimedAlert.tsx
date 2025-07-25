import * as React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Notification from '../../../utils/types/notification';
import StandardAlert from '../standardAlert/StandardAlert';

const SECS = 2000;

interface TimedAlertProps {
  color: typeof AlertColorTypes;
  delay?: number;
  testId: string;
  text: string;
}

export default function TimedAlert({ color, delay = 2, testId, text }: TimedAlertProps) {
  const [show, setShow] = React.useState(false);
  const { updateAppContent5 } = storageObject.useStore();

  function Notify(str: string, lvl: typeof AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str,
      okRequired: false
    };
    updateAppContent5(rec);
  }

  const closeFunction = () => {
    Notify('');
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
