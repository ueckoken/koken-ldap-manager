import { FC, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

const UpdatePage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [jwtData, setJwtData] = useState<any>("");

  useEffect(() => {
    if (!jwt) return;
    const decoded: any = jwt_decode(jwt);
    setJwtData(decoded);
  }, [jwt]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">更新届提出</h1>
      <p className="mb-4">2024年度の更新届は以下のリンクから提出してください</p>
      <a
        href={`https://docs.google.com/forms/d/e/1FAIpQLSftFmyVdufKYXa0VoDBmjlN5-dlMy5__yLKVMe5fgCHJ4ErWg/viewform?usp=pp_url&entry.800787902=${jwtData.uid}`}
        className="text-primary-600 hover:text-primary-700 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        2024年度入部/更新届
      </a>
    </div>
  );
};

export default UpdatePage;
