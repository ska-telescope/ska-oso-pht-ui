import Shell from '../../components/layout/Shell/Shell';
import TitleEntry from '../entry/TitleEntry/TitleEntry';

const PAGE = 0;

export default function TitlePage() {
  return (
    <Shell page={PAGE}>
      <TitleEntry page={PAGE} />
    </Shell>
  );
}
