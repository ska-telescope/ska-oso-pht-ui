import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import PageBannerPMT from '@/components/layout/pageBannerPMT/PageBannerPMT';
import OverviewButton from '@/components/button/Overview/Overview';
import { PMT } from '@/utils/constants';

export default function ReviewPageEntry() {
  const navigate = useNavigate();

  const overviewButton = () => (
    <OverviewButton
      action={() => navigate(PMT[0])}
      testId="pmtBackButton"
      title={'page.15.desc'}
      toolTip="page.15.toolTip"
    />
  );

  return <PageBannerPMT backBtn={overviewButton()} title={t('reviewPanelEntry.title')} />;
}
