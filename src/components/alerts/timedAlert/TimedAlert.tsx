import * as React from 'react';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardAlert from '../standardAlert/StandardAlert';
import StandardChip from '../standardChip/standardChip';
import { useNotify } from '@/utils/notify/useNotify';
import { ERROR_SECS } from '@/utils/constants';

interface TimedAlertProps {
  color: typeof AlertColorTypes;
  gap?: number;
  delay?: number;
  testId: string;
  text: string;
}

export default function TimedAlert({ color, gap = 1, delay = 2, testId, text }: TimedAlertProps) {
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
      }, delay * ERROR_SECS);
    };
    setShow(true);
    if (color === AlertColorTypes.Info || color === AlertColorTypes.Success) {
      timer();
    }
  }, [color, delay, text]);
  return (
    <>
      {show && gap !== 0 && (
        <StandardAlert
          color={color}
          testId={testId}
          text={text}
          closeFunc={closeFunction}
          fadeDuration={2000}
        />
      )}
      {show && gap === 0 && (
        <StandardChip
          color={color}
          testId={testId}
          text={text}
          closeFunc={closeFunction}
          fadeDuration={2000}
        />
      )}
    </>
  );
}
