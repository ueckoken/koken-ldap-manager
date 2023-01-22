import Token from "@/components/Token";
import { FC, useEffect, useState } from "react";
import { Container } from "react-bootstrap";

const TokenPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setJwt(token)
  }, [jwt])

  return (
    <>
      <Container>
        <h2>新規登録用Token</h2>
        ユーザに新規登録してもらう際はこのURLを共有してください。<br />
        Tokenは3時間有効ですが、タイミングによっては有効期限が切れている場合があるのでその場合はリロードしてください。<br />
        <Token jwt={jwt} />
      </Container>
    </>
  );
}

export default TokenPage;