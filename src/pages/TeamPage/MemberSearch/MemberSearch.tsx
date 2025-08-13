/* eslint-disable react/no-unstable-nested-components */
import { GetMockUserByEmail } from '@/services/axios/getUserByEmail/getUserByEmail';

export default function MemberSearch() {
  const fetchData = async () => {
    const response = await GetMockUserByEmail();
  };

  fetchData();

  return <p>To be implemented at a later date</p>;
}
