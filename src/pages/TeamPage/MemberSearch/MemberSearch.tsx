/* eslint-disable react/no-unstable-nested-components */
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import GetEntraUserByEmail from '@/services/axios/getEntraUserByEmail/getEntraUserByEmail';
import React from 'react';

export default function MemberSearch() {

  const authClient = useAxiosAuthClient();

  const fetchData = async () => {
    const response = await GetEntraUserByEmail(authClient, 'sarah.sattar@community.skao.int');
  }

  fetchData();

  
  return <p>To be implemented at a later date</p>;
}
