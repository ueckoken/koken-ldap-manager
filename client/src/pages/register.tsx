import { FC, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useRouter } from 'next/router'
import axios from "axios";



export default function RegisterPage() {
  const router = useRouter();
  const token = router.query.token;

  useEffect(() => {
    (async () => {
      // veridate token
      const res = await axios(`http://localhost:8000/token/verify?token=${token}`, {
        method: "GET"
      });
      console.log(res);
      if (!res.data.valid) {
        alert("Invalid token");
        // router.push("/");
      }
    })()
  }, [])

  return (
    <>
      <h2>新規登録</h2>
      <p>新規登録は管理者からの招待リンクからのみ可能です。</p>
      {token}
    </>
  );
}