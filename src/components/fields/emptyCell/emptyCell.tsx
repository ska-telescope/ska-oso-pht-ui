import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { STATUS_ERROR, STATUS_ERROR_SYMBOL } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function EmptyCell() {
  const { t } = useScopedTranslation();
  const SIZE = 30;

  return (
    <StatusIcon
      ariaDescription={t('empty.cell')}
      ariaTitle={t('empty.cell')}
      text={STATUS_ERROR_SYMBOL}
      level={STATUS_ERROR}
      size={SIZE}
      testId="emptyCell"
      toolTip={t('empty.cell')}
    />
  );
}
