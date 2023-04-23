import { LdapGroup } from "./LdapGroup.d";
export interface LdapUser {
  fullName: string;
  firstName: string;
  lastName: string;
  username: string;
  gid: number;
  uid: number;
  discordId: string;
  email: string;
  studentId: string;
  telephoneNumber: string;
  groups: string[];
}
