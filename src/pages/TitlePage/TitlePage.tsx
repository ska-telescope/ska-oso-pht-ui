import Shell from '../../components/layout/Shell/Shell';
import TitleEntry from '../entry/TitleEntry/TitleEntry';
import { PAGE_TITLE_ADD } from '@/utils/constants';

const PAGE = PAGE_TITLE_ADD;

export default function TitlePage() {
  return (
    <Shell page={PAGE}>
      <TitleEntry page={PAGE} />
    </Shell>
  );
}
