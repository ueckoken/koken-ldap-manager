import Token from "@/components/Token";
import { FC, useEffect, useState } from "react";

const TokenPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, []); // 初回マウント時のみ実行

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">新規登録用Token</h2>
      <p className="mb-4">
        ユーザに新規登録してもらう際はこのURLを共有してください。
      </p>
      <p className="mb-4">
        Tokenは3時間有効ですが、タイミングによっては有効期限が切れている場合があるのでその場合はリロードしてください。
      </p>
      <Token jwt={jwt} />
    </div>
  );
};

export default TokenPage;
