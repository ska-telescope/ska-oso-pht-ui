import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import BackButton from '@/components/button/Back/Back';
import { PMT } from '@/utils/constants';

export default function ReviewPageEntry() {
  const navigate = useNavigate();

  const backButton = () => (
    <BackButton
      action={() => navigate(PMT[0])}
      testId="pmtBackButton"
      title={'page.15.desc'}
      toolTip="page.15.toolTip"
    />
  );

  return <PageBannerPMT backBtn={backButton()} title={t('reviewPanelEntry.title')} />;
}
