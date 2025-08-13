import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import Notification from '@/utils/types/notification';

export function useNotify() {
  const { updateAppContent5 } = storageObject.useStore();

  function notify(str: string, lvl: typeof AlertColorTypes, delay: number | undefined = undefined) {
    const rec: Notification = {
      level: lvl,
      delay: delay,
      message: str
    };
    updateAppContent5(rec);
  }

  return {
    notifyClear: () => notify('', AlertColorTypes.Info),
    notifyError: (msg: string, delay: number | undefined = undefined) =>
      notify(msg, AlertColorTypes.Error, delay),
    notifySuccess: (msg: string, delay: number | undefined = undefined) =>
      notify(msg, AlertColorTypes.Success, delay),
    notifyWarning: (msg: string, delay: number | undefined = undefined) =>
      notify(msg, AlertColorTypes.Warning, delay),
    notifyInfo: (msg: string, delay: number | undefined = undefined) =>
      notify(msg, AlertColorTypes.Info, delay)
  };
}
