import { useTranslation } from 'react-i18next';
import PageHeaderPMT from '@/components/layout/pageHeaderPMT/PageHeaderPMT';

export default function ReviewPage() {
  const { t } = useTranslation('pht');
  return <PageHeaderPMT title={t('menuOptions.reviews')} />;
}
