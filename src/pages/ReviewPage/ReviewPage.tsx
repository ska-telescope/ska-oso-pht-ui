import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import BackButton from '@/components/button/Back/Back';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import { PMT } from '@/utils/constants';

export default function ReviewPage() {
  const navigate = useNavigate();

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[2])}
      testId="overviewButtonTestId"
      title={'overview.label'}
      toolTip="overview.toolTip"
    />
  );

  return <PageBannerPMT title={t('menuOptions.reviews')} backBtn={backButton()} />;
}
