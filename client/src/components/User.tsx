import axios from "axios";
import { FC, useEffect, useState } from "react";

const User: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [firstName, setfirstName] = useState<string>("");
  const [lastName, setlastName] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [gid, setGid] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [groups, setGroups] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (!jwt) return;
    (async () => {
      const res: any = await axios("http://localhost:8000/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      const data = res.data;
      setUsername(data.username);
      setfirstName(data.firstName);
      setlastName(data.lastName);
      setUid(data.uid);
      setGid(data.gid);
      setDiscordId(data.discordId);
      setGroups(data.groups);
      setEmail(data.email);
    })();
  }, [jwt]);

  const updateUserInfo = async () => {
    if (!jwt) return;
    const res: any = await axios("http://localhost:8000/user/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      data: {
        firstName,
        lastName,
        discordId,
        email
      },
    });
    const data = res.data;
    setfirstName(data.firstName);
    setlastName(data.lastName);
    setDiscordId(data.discordId);
    setEmail(data.email);
    if (password != "") {
      const res: any = await axios("http://localhost:8000/user/password", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        data: {
          password
        },
      });
      setPassword("");
    }
  };

  return (
    <>
      <p>{
        jwt
          ? "ログイン済み"
          : "未ログイン"
      }</p>
      <p>username: {username}</p>
      <input type="text" name="firstName" value={firstName} placeholder="firstName" onChange={(e) => setfirstName(e.target.value)} />
      <input type="text" name="firstName" value={lastName} placeholder="lastName" onChange={(e) => setfirstName(e.target.value)} />
      <p>uid: {uid}</p>
      <p>gid: {gid}</p>
      <p>discordId:
        <input type="text" name="discordId" value={discordId} placeholder="discordId" onChange={(e) => setDiscordId(e.target.value)} />
      </p>
      <p>email:
        <input type="email" name="email" value={email} placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      </p>
      <p>groups: {groups.join(", ")}</p>
      <p>新しいパスワード: <input type="password" name="password" value={password} placeholder="password" onChange={(e) => setPassword(e.target.value)} /></p>
      <button onClick={updateUserInfo}>更新</button>
    </>
  )
}

export default User;