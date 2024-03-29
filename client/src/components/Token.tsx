import axios from "axios";
import { FC, useEffect, useState } from "react";

const Token: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [token, setToken] = useState<string | undefined>();
  const abortController = new AbortController();
  useEffect(() => {
    if (!jwt) return;
    (async () => {
      const res: any = await axios(
        `${process.env["NEXT_PUBLIC_API_BASEURL"]}/token/issue`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          signal: abortController.signal,
        }
      );
      const data = res.data;
      setToken(data.token);
    })();
    return () => {
      abortController.abort();
    };
  }, [jwt]);

  return (
    <>
      <p>
        Token: <code>{token}</code>
        <br />
        登録URL:{" "}
        <a
          href={
            `${process.env["NEXT_PUBLIC_SITE_BASEURL"]}/register?token=` + token
          }
        >
          {" "}
          {process.env["NEXT_PUBLIC_SITE_BASEURL"]}/register?token={token}
        </a>
      </p>
    </>
  );
};

export default Token;
