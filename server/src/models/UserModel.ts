import { generateNTLMHash } from "../utils/hash";
import { IClientConfig, Client } from "ldap-ts-client";
import { LdapUser } from "../types/LdapUser";
import { getUserGroup } from "./GroupModel";
const ssha = require("ssha");

const SID_PREFIX = process.env["SID_PREFIX"];
const adminPassword = process.env["ADMIN_PASSWORD"];

const config: IClientConfig = {
  ldapServerUrl: "ldap://ldap.ueckoken.club",
  user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
  pass: adminPassword,
};

export async function getCurrentUserId(): Promise<number> {
  const client = new Client(config);
  const curid = await client.queryAttributes({
    base: "cn=curid,ou=idpoolconf,dc=ldap,dc=ueckoken,dc=club",
    attributes: ["uidNumber"],
  });
  await client.unbind();
  return Number(curid[0].uidNumber);
}

export async function getCurrentGroupId(): Promise<number> {
  const client = new Client(config);
  const curid = await client.queryAttributes({
    base: "cn=curid,ou=idpoolconf,dc=ldap,dc=ueckoken,dc=club",
    attributes: ["gidNumber"],
  });
  await client.unbind();
  return Number(curid[0].gidNumber);
}

export async function updateCurrentUserId(uid: number): Promise<void> {
  const client = new Client(config);
  await client.modifyAttribute({
    dn: "cn=curid,ou=idpoolconf,dc=ldap,dc=ueckoken,dc=club",
    changes: [
      {
        operation: "replace",
        modification: {
          uidNumber: uid,
        },
      },
    ],
  });
  await client.unbind();
}

export async function getAllusers(): Promise<LdapUser[]> {
  const client = new Client(config);
  const results = await client.queryAttributes({
    base: "ou=people,dc=ldap,dc=ueckoken,dc=club",
    attributes: [
      "uidNumber",
      "gidNumber",
      "cn",
      "givenName",
      "sn",
      "uid",
      "displayName",
      "mail",
      "telephoneNumber",
      "employeeNumber",
    ],
    options: {
      filter: "(objectClass=posixAccount)",
      scope: "sub",
    },
  });
  await client.unbind();
  let users: LdapUser[] = [];

  for (let data of results) {
    const groups = await getUserGroup(String(data.uid));
    if (groups === undefined) continue;
    const userGroupNames: string[] = groups.map((group) => group.name);
    users.push({
      fullName: data.cn,
      firstName: data.sn,
      lastName: data.givenName,
      uid: Number(data.uidNumber),
      gid: Number(data.gidNumber),
      discordId: data.displayName,
      groups: userGroupNames,
      username: data.uid,
      email: data.mail,
      telephoneNumber: data.telephoneNumber,
      studentId: data.employeeNumber,
    } as LdapUser);
  }
  return users;
}

export async function getUser(uid: string): Promise<LdapUser> {
  const client = new Client(config);
  const results = await client.queryAttributes({
    base: "ou=people,dc=ldap,dc=ueckoken,dc=club",
    attributes: [
      "uidNumber",
      "gidNumber",
      "cn",
      "givenName",
      "sn",
      "uid",
      "displayName",
      "mail",
      "telephoneNumber",
      "employeeNumber",
    ],
    options: {
      filter: "(uid=" + uid + ")",
      scope: "sub",
    },
  });
  await client.unbind();
  const data = results[0];
  const groups = await getUserGroup(uid);
  if (groups === undefined) throw new Error("User not found");
  const userGroupNames: string[] = groups.map((group) => group.name);
  const user: LdapUser = {
    fullName: data.cn,
    firstName: data.sn,
    lastName: data.givenName,
    uid: Number(data.uidNumber),
    gid: Number(data.gidNumber),
    discordId: data.displayName,
    groups: userGroupNames,
    username: data.uid,
    email: data.mail,
    telephoneNumber: data.telephoneNumber,
    studentId: data.employeeNumber,
  } as LdapUser;
  return user;
}

export async function createNewUser(
  username: string,
  firstname: string,
  lastname: string,
  password: string,
  discordId: string,
  email: string,
  phonenumber: string,
  studentid: string
): Promise<LdapUser> {
  const client = new Client(config);
  client.bind({
    user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
    pass: adminPassword,
  });
  /* 最新のUIDをPoolから取ってくる */
  const uidNumber: number = await getCurrentUserId();

  /* UID PoolのUIDをincrementする
    uidはuniqueなのでincrementしないとidpoolと衝突する
  */
  await updateCurrentUserId(uidNumber + 1);

  /* パスワードをSolt付きSHA1でハッシュ化する */
  const RFCFormatPasswordHash = ssha.create(password);

  /* Samba用にLM/NTLMでハッシュ化する */
  const [lmHashedPassword, ntHashedPassword] = generateNTLMHash(password);

  try {
    const isSuccesful = await client.add({
      dn: `uid=${username},ou=people,dc=ldap,dc=ueckoken,dc=club`,
      entry: {
        /* Object Class */
        objectclass: [
          "top",
          "posixAccount",
          "shadowAccount",
          "person",
          "organizationalPerson",
          "inetOrgPerson",
          "sambaSamAccount",
          "sambaIdmapEntry",
          "apple-user",
        ],
        /* CN(Full Name) */
        cn: `${firstname} ${lastname}`,
        /* Description */
        description: "Auto generated by Koken LDAP Manager",
        /* DiscordID(KeyCloakでMapping済み) */
        displayname: discordId,
        /* Gropu Number(UNIX) */
        gidnumber: "1000000",
        /* 苗字 */
        sn: `${firstname}`,
        /* 名前 */
        givenname: `${lastname}`,
        /* Home Directory */
        homedirectory: `/home/${username}`,
        /* MailAddress */
        mail: email,
        /* ユーザーID (must be unique) */
        uid: username,
        /* 電話番号 */
        telephoneNumber: phonenumber,
        /* 学籍番号 */
        employeeNumber: studentid,
        /* ユーザーID (ユーザーが作られた順番に振られる) */
        uidnumber: String(uidNumber),
        /* ユーザパスワード (SHA512でハッシュ済み) */
        userpassword: RFCFormatPasswordHash,
        /* パスワードの最終更新日 */
        pwdlastset: "-1" /* -1: 更新していない */,
        /* Sambaでのアカウント種別 */
        sambaacctflags: "[U          ]" /* U:User, W:Workstation... */,
        /* Sambaの有効期限 */
        sambakickofftime: "0" /* 0: 無効にしない */,
        /* SambaLanManagerPassword: lmHashed */
        sambalmpassword: lmHashedPassword,
        /* Samba NTPassword: md4 hashed(NTLM) */
        sambantpassword: ntHashedPassword,
        /* Sambaのパスワード変更履歴 */
        sambapasswordhistory:
          "0000000000000000000000000000000000000000000000000000000000000000",
        /* Samba Passwordの最終更新日 */
        sambapwdlastset: String(Date.now()),
        /* ユーザーのSambaId : 先頭部分は固定で、最後がユーザー固有(1000+uidNumber%1000000*2)  */
        sambasid: `${SID_PREFIX}-${1000 + (uidNumber % 1000000) * 2}`,
        /* パスワードが期限切れになってから何日で無効にするか */
        shadowexpire: "-1" /* -1: 無効にしない */,
        /* 予約 (defaultで0) */
        shadowflag: "0",
        /* パスワードの有効期限 */
        shadowinactive: "0" /* 0: 無効にしない */,
        /* パスワードの最終更新日 (1970/1/1からの日数) */
        shadowlastchange: String(
          Math.floor(
            (new Date().getTime() - new Date("1970/01/01").getTime()) / 86400000
          )
        ) /* 0: 初回ログイン時に変更を求める */,
        /* パスワード変更要求までの日数 */
        shadowmax: "99999" /* 99999: 無期限 */,
        /* パスワード変更不能日数 (一度パスワードを変更した後) */
        shadowmin: "0" /* 0: 特に制限しない */,
        /* パスワード期限満了時に警告を何日前に出すか */
        shadowwarning: "7",
      },
    });
  } catch (error) {
    await updateCurrentUserId(uidNumber);
    if (error instanceof Error) {
      throw new Error("Failed to create new user:" + error.message);
    }
  }
  await client.unbind();

  return {
    fullName: `${firstname} ${lastname}`,
    firstName: firstname,
    lastName: lastname,
    username: username,
    uid: uidNumber,
    gid: 1000000,
    discordId: discordId,
    email: email,
    telephoneNumber: phonenumber,
    studentId: studentid,
    groups: [],
  } as LdapUser;
}

export async function updateUserPassword(
  uid: string,
  newPassword: string
): Promise<void> {
  const client = new Client(config);
  await client.bind({
    user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
    pass: adminPassword,
  });

  const RFCFormatPasswordHash = ssha.create(newPassword);
  const [lmHashedPassword, ntHashedPassword] = generateNTLMHash(newPassword);

  try {
    const isSuccesful = await client.modifyAttribute({
      dn: `uid=${uid},ou=people,dc=ldap,dc=ueckoken,dc=club`,
      changes: [
        {
          operation: "replace",
          modification: {
            userpassword: RFCFormatPasswordHash,
            sambalmpassword: lmHashedPassword,
            sambantpassword: ntHashedPassword,
            sambapwdlastset: String(Date.now()),
            shadowlastchange: String(
              Math.floor(
                (new Date().getTime() - new Date("1970/01/01").getTime()) /
                86400000
              )
            ),
          },
        },
      ],
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to update user password:" + error.message);
    }
  }
  await client.unbind();
}

export async function updateUser(
  uid: string,
  discordId: string,
  email: string,
  firstname: string,
  lastname: string,
  telephoneNumber: string,
  studentId: string
): Promise<void> {
  // 環境変数のチェック
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD環境変数が設定されていません");
  }

  console.log(`ユーザー更新開始: uid=${uid}, discordId=${discordId}`);

  const client = new Client(config);

  try {
    await client.bind({
      user: "cn=admin,dc=ldap,dc=ueckoken,dc=club",
      pass: adminPassword,
    });
    console.log("LDAP接続成功");

    try {
      // ユーザーが存在するか確認
      const userExists = await client.queryAttributes({
        base: `uid=${uid},ou=people,dc=ldap,dc=ueckoken,dc=club`,
        attributes: ["uid"],
        options: {
          scope: "base"
        }
      });

      if (!userExists || userExists.length === 0) {
        throw new Error(`ユーザーが見つかりません: uid=${uid}`);
      }

      console.log("ユーザー存在確認完了");

      await client.modifyAttribute({
        dn: `uid=${uid},ou=people,dc=ldap,dc=ueckoken,dc=club`,
        changes: [
          {
            operation: "replace",
            modification: {
              mail: email,
              givenName: lastname,
              sn: firstname,
              cn: `${lastname} ${firstname}`,
              displayname: discordId,
              telephoneNumber: telephoneNumber,
              employeeNumber: studentId,
            },
          },
        ],
      });
      console.log("ユーザー属性更新成功");
    } catch (e) {
      console.error("LDAP更新エラー:", e);
      if (e instanceof Error) {
        throw new Error(`ユーザー更新に失敗しました: ${e.message}`);
      } else {
        throw new Error("ユーザー更新に失敗しました: 不明なエラー");
      }
    }
  } catch (bindError) {
    console.error("LDAP接続エラー:", bindError);
    if (bindError instanceof Error) {
      throw new Error(`LDAP接続に失敗しました: ${bindError.message}`);
    } else {
      throw new Error("LDAP接続に失敗しました: 不明なエラー");
    }
  } finally {
    try {
      await client.unbind();
      console.log("LDAP接続終了");
    } catch (unbindError) {
      console.error("LDAP切断エラー:", unbindError);
    }
  }
}
