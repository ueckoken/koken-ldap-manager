import { LdapGroup } from './../types/LdapGroup.d';
require('dotenv').config();

import { IClientConfig, Client } from "ldap-ts-client";

const SID_PREFIX = process.env["SID_PREFIX"];
const adminPassword = process.env["ADMIN_PASSWORD"];

const config: IClientConfig = {
  ldapServerUrl: "ldap://ldap.ueckoken.club",
  user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
  pass: adminPassword
};

export async function getAllgroups(): Promise<LdapGroup[]> {
  const client = new Client(config);
  await client.bind({
    user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
    pass: adminPassword
  })
  const results = await client.queryAttributes({
    base: "ou=group,dc=ldap,dc=ueckoken,dc=club",
    attributes: ["*"],
    options: {
      scope: "sub",
      filter: "(objectClass=posixGroup)"
    }
  });
  let groups: LdapGroup[] = [];
  for (let data of results) {
    groups.push({
      name: data.cn,
      gid: Number(data.gidNumber),
      members: data.memberUid
    } as LdapGroup)
  }
  await client.unbind();
  return groups
}

export async function getUserGroup(uid: string): Promise<LdapGroup[] | undefined> {
  const client = new Client(config);
  try {
    const results = await client.queryAttributes({
      base: "ou=group,dc=ldap,dc=ueckoken,dc=club",
      attributes: ["*"],
      options: {
        scope: "sub",
        filter: "(memberUid=" + uid + ")"
      }
    });
    let groups: LdapGroup[] = [];
    let data: any;
    for (data of results) {
      groups.push({
        name: data.cn,
        gid: Number(data.gidNumber),
        members: data.memberUid
      } as LdapGroup)
    }
    client.unbind();
    return groups
  } catch (error) {
    if (error instanceof Error)
      throw new Error(error.message)
  }
}

export async function addUserToGroup(uid: string, groupName: string) {
  const client = new Client(config);
  try {
    client.modifyAttribute({
      dn: "cn=" + groupName + ",ou=group,dc=ldap,dc=ueckoken,dc=club",
      changes: [{
        operation: "add",
        modification: {
          memberUid: uid
        }
      }]
    })
  } catch (error) {
    if (error instanceof Error)
      throw new Error(error.message)
  }
  client.unbind();
}

export async function removeUserFromGroup(uid: string, groupName: string) {
  const client = new Client(config);
  try {
    client.modifyAttribute({
      dn: "cn=" + groupName + ",ou=group,dc=ldap,dc=ueckoken,dc=club",
      changes: [{
        operation: "delete",
        modification: {
          memberUid: uid
        }
      }]
    })
  } catch (error) {
    if (error instanceof Error)
      throw new Error(error.message)
  }
  client.unbind();
}