import User from "@/components/User";
import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";

const UserPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [discordConnected, setDiscordConnected] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
    
    // Discord連携後のリダイレクトを処理
    if (router.query.discord_connected === "true") {
      setDiscordConnected(true);
      // URLパラメータをクリア
      router.replace("/user", undefined, { shallow: true });
      
      // 3秒後に通知を消す
      setTimeout(() => {
        setDiscordConnected(false);
      }, 3000);
    }
  }, [router.query, router]); // クエリパラメータが変更されたときに実行

  return (
    <>
      {discordConnected && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded fixed top-4 right-4 max-w-md shadow-lg">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Discordとの連携が完了しました！</span>
          </div>
        </div>
      )}
      <User jwt={jwt} isAdmin={false} targetUser={null} />
    </>
  );
};

export default UserPage;
