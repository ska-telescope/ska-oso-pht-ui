import * as React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import Notification from '../../../utils/types/notification';
import StandardAlert from '../standardAlert/StandardAlert';

const SECS = 1000;

interface TimedAlertProps {
  color: AlertColorTypes;
  delay?: number;
  testId: string;
  text: string;
}

export default function TimedAlert({ color, delay = 2, testId, text }: TimedAlertProps) {
  const [show, setShow] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false)
  const { updateAppContent5 } = storageObject.useStore();

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: str,
      okRequired: false
    };
    updateAppContent5(rec);
  }

  React.useEffect(() => {
   // console.log('useEffect isMounted', isMounted)
  
    // if(true){
    //   const setClear = () => {
    //     Notify('', AlertColorTypes.Info);
    //   };
  
    //   console.log('delay * SECS', delay * SECS)
  
    //   const timer = () => {
    //     setTimeout(() => {
    //       setClear();
    //       setShow(false);
    //     }, delay * SECS);
    //   };
  
    //   setShow(true);
    //   timer();
    // }
    setIsMounted(true)
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      const setClear = () => {
        Notify('', AlertColorTypes.Info);
      };

      console.log('delay * SECS', delay * SECS)

      const timer = () => {
        setTimeout(() => {
          setClear();
          setShow(false);
        }, delay * SECS);
      };

      setShow(true);
      timer();
    }

  }, [isMounted]);

  // React.useEffect(() => {
    
  //   const setClear = () => {
  //     Notify('', AlertColorTypes.Info);
  //   };

  //   console.log('delay * SECS', delay * SECS)

  //   const timer = () => {
  //     setTimeout(() => {
  //       setClear();
  //       setShow(false);
  //     }, delay * SECS);
  //   };

  //   setShow(true);
  //   timer();
  // }, []);

  

  return <>{show && <StandardAlert color={color} testId={testId} text={text} />}</>;
}
