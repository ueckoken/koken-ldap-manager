import axios from "axios";
import router from "next/router";
import { FC, useEffect, useState } from "react";
import { Card, Form, InputGroup, Button } from "react-bootstrap";
import jwt_decode from "jwt-decode";

const User: FC<{ jwt: string | null, isAdmin: boolean, targetUser: string | null }> = ({ jwt, isAdmin, targetUser }) => {
  const [firstName, setfirstName] = useState<string>("");
  const [lastName, setlastName] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [gid, setGid] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [groups, setGroups] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [definedGroups, setDefinedGroups] = useState<string[]>([]);

  useEffect(() => {
    if (!jwt) return;
    (async () => {
      const res0: any = await axios(`${process.env["NEXT_PUBLIC_API_BASEURL"]}/group/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      });
      let data0 = res0.data;
      data0 = data0.filter((group: string) => group !== "Domain Users");
      setDefinedGroups(data0);
      const res: any = await axios(
        isAdmin ? `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile/${targetUser}` : `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile`
        , {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
      const data = res.data;
      // remove Domain Users
      data.groups = data.groups.filter((group: string) => group !== "Domain Users");
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
    const res: any = await axios(
      isAdmin ? `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile/${targetUser}` : `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile`
      , {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        data: {
          firstName: firstName,
          lastName: lastName,
          discordId: discordId,
          email: email,
          groups: groups
        },
      });
    alert("ユーザー情報を変更しました");
    if (isAdmin)
      router.push("/admin/" + targetUser);
    else
      router.push("/user");
    if (password != "") {
      if (password != confirmPassword) {
        alert("パスワードが一致しません");
        return;
      }
      if (password.length < 6) {
        alert("パスワードは6文字以上にしてください");
        return;
      }
      const res: any = await axios(
        isAdmin ? `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/password/${targetUser}` : `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/password`
        , {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          data: {
            password
          },
        });
      alert("パスワードを変更しました");
      setPassword("");
    }
  };

  return (
    <>
      <div className="pt-3">
        <h3 className="text-center">ユーザー情報</h3>
        <Card style={{ width: '30rem' }} className="mx-auto border-white">
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>UID</Form.Label>
                <Form.Control type="text" value={uid} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>GID</Form.Label>
                <Form.Control type="text" value={gid} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Groups</Form.Label>
                {
                  definedGroups.map((group: string) => {
                    return (
                      <Form.Check
                        disabled={!isAdmin}
                        key={group}
                        type="checkbox"
                        label={group}
                        checked={groups.includes(group)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroups([...groups, group]);
                          } else {
                            setGroups(groups.filter((g: string) => g !== group));
                          }
                        }
                        }
                      />
                    )
                  })
                }
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ユーザー名(変更不可)</Form.Label>
                <Form.Control type="text" onChange={(e) => setUsername(e.target.value)} value={username} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>名前</Form.Label>
                <InputGroup>
                  <Form.Control type="text" value={firstName} onChange={(e) => setfirstName(e.target.value)} />
                  <Form.Control type="text" value={lastName} onChange={(e) => setlastName(e.target.value)} />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discord ID</Form.Label>
                <Form.Control type="text" value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Eメール</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>パスワード(6文字以上)</Form.Label>
                <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>パスワード(確認用)</Form.Label>
                <Form.Control type="password" onChange={(e) => setConfirmPassword(e.target.value)} />
              </Form.Group>
              <Button variant="primary" className="w-100" onClick={updateUserInfo}>
                更新
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  )
}

export default User;