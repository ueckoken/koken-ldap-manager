import { FC, useEffect, useState } from "react";
import axios from "axios";

interface DiscordOAuthProps {
  jwt: string | null;
  discordId: string;
  setDiscordId: (id: string) => void;
}

const DiscordOAuth: FC<DiscordOAuthProps> = ({ jwt, discordId, setDiscordId }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Discord IDが数値のみで構成されているかチェック、"NOSET"の場合は未連携
  useEffect(() => {
    if (discordId && discordId !== "NOSET" && /^\d+$/.test(discordId)) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [discordId]);

  // Discord OAuth認証URLを生成
  const generateDiscordOAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/discord-callback`);
    const scope = encodeURIComponent("identify");
    
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  // Discord連携を開始
  const startDiscordConnection = () => {
    window.location.href = generateDiscordOAuthUrl();
  };

  // Discord連携を解除
  const disconnectDiscord = async () => {
    if (!jwt) return;
    
    try {
      setIsLoading(true);
      await axios(`${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/discord/disconnect`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      setDiscordId("NOSET"); // 空文字列ではなく"NOSET"に設定
      setIsConnected(false);
    } catch (error) {
      console.error("Discord連携解除に失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {isConnected ? (
        <div className="flex items-center">
          <span className="text-green-600 dark:text-green-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Discord連携済み (ID: {discordId})</span>
          <button
            onClick={disconnectDiscord}
            disabled={isLoading}
            className="ml-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            {isLoading ? "処理中..." : "連携解除"}
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-yellow-600 dark:text-yellow-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Discord未連携</span>
          <button
            onClick={startDiscordConnection}
            className="ml-2 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Discordと連携する
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscordOAuth;
