import User from "@/components/User";
import { FC, useEffect, useState } from "react";
import axios from "axios";

const LoginPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassowrd] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setJwt(token)
  }, [])

  const onClickLogin = async () => {
    const res: any = await axios("http://localhost:8000/auth/login", {
      method: "POST",
      data: {
        username: userId,
        password: password
      },
    })
    if (res.data.httpCode && res.data.httpCode != 200) { alert(res.data.message); return; }
    const token = res.data.token;
    setJwt(token);
    alert("Login success")
    localStorage.setItem("token", token);
  }

  const onClickLogout = () => {
    setJwt(null);
    localStorage.removeItem("token");
  }

  return (
    <>
      <h1>Login</h1>
      <input
        type="text"
        name="username"
        placeholder="username"
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="password"
        name="password"
        placeholder="password"
        onChange={(e) => setPassowrd(e.target.value)}
      />
      <button onClick={onClickLogin}>Login</button>
      <button onClick={onClickLogout}>Logout</button>
    </>
  );
}

export default LoginPage;
