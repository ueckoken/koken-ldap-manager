import axios from "axios";
import { FC, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

const Token: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [token, setToken] = useState<string>("");
  useEffect(() => {
    if (!jwt) return;
    (async () => {
      const res: any = await axios("http://localhost:8000/token/issue", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      const data = res.data;
      setToken(data.token);
    })();
  }, []);

  return (
    <>
      <p>Token: <code>{token}</code><br />
        登録URL: <a href={"http://localhost:3000/register?token=" + token} > https://localhost:3000/register?token={token}</a>
      </p>
    </>
  );
};

export default Token;