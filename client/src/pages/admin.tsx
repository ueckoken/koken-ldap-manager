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
      <h1>Users</h1>
      <UserList jwt={jwt} />
    </>
  );
}

export default AdminPage;