import User from "@/components/User";
import { FC, useEffect, useState } from "react";

const UserPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, []); // 初回マウント時のみ実行

  return (
    <>
      <User jwt={jwt} isAdmin={false} targetUser={null} />
    </>
  );
};

export default UserPage;
