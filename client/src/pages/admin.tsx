import Token from "@/components/Token";
import UserList from "@/components/UserList";
import { FC, useEffect, useState } from "react";

const AdminPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setJwt(token)
  })

  return (
    <>
      <h2>ユーザー一覧</h2>
      <UserList jwt={jwt} />
      <h2>新規登録用Token</h2>
      ユーザに新規登録してもらう際はこのURLを共有してください。<br />
      Tokenは3時間有効ですが、タイミングによっては有効期限が切れている場合があるのでその場合はリロードしてください。<br />
      <Token jwt={jwt} />
    </>
  );
}

export default AdminPage;