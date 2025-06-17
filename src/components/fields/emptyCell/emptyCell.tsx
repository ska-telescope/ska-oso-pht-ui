import { useTranslation } from 'react-i18next';
import StatusIconDisplay from '../../icon/status/statusIcon';
import { STATUS_ERROR } from '../../../utils/constants';

export default function EmptyCell() {
  const { t } = useTranslation('pht');
  const SIZE = 20;

  return (
    <StatusIconDisplay
      ariaDescription={t('empty.cell')}
      ariaTitle={t('empty.cell')}
      level={STATUS_ERROR}
      onClick={undefined}
      size={SIZE}
      testId="emptyCell"
      toolTip={t('empty.cell')}
    />
  );
}
