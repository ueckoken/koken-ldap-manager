import { FC, useEffect, useState } from "react";
import { useRouter } from 'next/router'
import axios from "axios";
import { Button, Card, Form, InputGroup } from "react-bootstrap";



export default function RegisterPage() {
  const router = useRouter();
  const token = router.query.token;
  const usernameQuery = router.query.username;
  const firstnameQuery = router.query.firstname;
  const lastnameQuery = router.query.lastname;
  const emailQuery = router.query.email;

  const [username, setusername] = useState<string>("");
  const [password, setPassowrd] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");

  useEffect(() => {
    if (!token) return;
    (async () => {
      // veridate token
      const res = await axios(`${process.env["NEXT_PUBLIC_API_BASEURL"]}/token/verify?token=${token}`, {
        method: "GET"
      });
      console.log(res);
      if (!res.data.valid) {
        alert("Invalid token");
        router.push("/");
      }
      if (usernameQuery) setusername(usernameQuery as string);
      if (firstnameQuery) setFirstName(firstnameQuery as string);
      if (lastnameQuery) setLastName(lastnameQuery as string);
      if (emailQuery) setEmail(emailQuery as string);
    })()
  }, [token])

  const checkPassword = (password: string) => {
    if (password.length < 6) {
      alert("パスワードは6文字以上にしてください");
      return false;
    }
    if (password != confirmPassword) {
      alert("パスワードが一致しません");
      return false;
    }
    return true;
  }

  const onClickRegister = async () => {
    if (!checkPassword(password)) return;
    try {
      const res = await axios(`${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/register/token`, {
        method: "POST",
        data: {
          username,
          password,
          firstName,
          lastName,
          email,
          discordId,
          token
        }
      });
      const data = res.data;
      if (res.data.httpCode && res.data.httpCode != 200) { alert(res.data.message); return; }
      alert("登録が完了しました");
      router.push("/");
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.message);
    }
  }

  return (
    <>
      <div className="pt-3">
        <h3 className="text-center">アカウント登録</h3>
        <Card style={{ width: '30rem' }} className="mx-auto border-white">
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ユーザー名(変更不可)</Form.Label>
                <Form.Control type="text" onChange={(e) => setusername(e.target.value)} placeholder="takumikentaro" />
                <small>既に使用されているユーザー名は使えません</small>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>名前</Form.Label>
                <InputGroup>
                  <Form.Control type="text" placeholder="工研" onChange={(e) => setFirstName(e.target.value)} />
                  <Form.Control type="text" placeholder="太郎" onChange={(e) => setLastName(e.target.value)} />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Discord ID</Form.Label>
                <Form.Control type="text" placeholder="kokenuser#1962" onChange={(e) => setDiscordId(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Eメール</Form.Label>
                <Form.Control type="email" placeholder="ueckoken@gmail.com" onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>パスワード(6文字以上)</Form.Label>
                <Form.Control type="password" onChange={(e) => setPassowrd(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>パスワード(確認用)</Form.Label>
                <Form.Control type="password" onChange={(e) => setConfirmPassword(e.target.value)} />
              </Form.Group>
              <Button variant="primary" className="w-100" onClick={onClickRegister}>
                登録
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}