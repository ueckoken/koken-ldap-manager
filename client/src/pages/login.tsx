import User from "@/components/User";
import { FC, useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Form } from "react-bootstrap";

const LoginPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassowrd] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, []);

  const onClickLogin = async () => {
    const res: any = await axios(
      `${process.env["NEXT_PUBLIC_API_BASEURL"]}/auth/login`,
      {
        method: "POST",
        data: {
          username: userId,
          password: password,
        },
      }
    );
    if (res.data.httpCode && res.data.httpCode != 200) {
      alert(res.data.message);
      return;
    }
    const token = res.data.token;
    setJwt(token);
    localStorage.setItem("token", token);
    // redirect to home
    window.location.href = "/";
  };

  return (
    <div className="pt-3">
      <h5 className="text-center">ログイン</h5>
      <Card style={{ width: "20rem" }} className="mx-auto">
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>ユーザーID</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => setUserId(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>パスワード</Form.Label>
              <Form.Control
                type="password"
                onChange={(e) => setPassowrd(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" className="w-100" onClick={onClickLogin}>
              ログイン
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
