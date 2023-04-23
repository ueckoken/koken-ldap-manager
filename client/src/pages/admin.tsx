import UserList from "@/components/UserList";
import { FC, useEffect, useState } from "react";

const AdminPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, [jwt]);

  return (
    <>
      <h2>ユーザー一覧</h2>
      <UserList jwt={jwt} />
    </>
  );
};

export default AdminPage;
