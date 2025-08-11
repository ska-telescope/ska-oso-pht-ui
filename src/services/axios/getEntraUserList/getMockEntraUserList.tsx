import { MockEntraUserListFrontend } from './mockEntraUserListFrontend';
import { EntraUser } from '@/utils/types/teamMember';

export function GetMockEntraUserList(): EntraUser[] {
  return MockEntraUserListFrontend;
}

export default GetMockEntraUserList;
