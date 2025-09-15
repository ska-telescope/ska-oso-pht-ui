import StatusIconDisplay from '../../icon/status/statusIcon';
import { STATUS_ERROR } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function EmptyCell() {
  const { t } = useScopedTranslation();
  const SIZE = 20;

  return (
    <StatusIconDisplay
      ariaDescription={t('empty.cell')}
      ariaTitle={t('empty.cell')}
      level={STATUS_ERROR}
      onClick={() => {}}
      size={SIZE}
      testId="emptyCell"
      toolTip={t('empty.cell')}
    />
  );
}
