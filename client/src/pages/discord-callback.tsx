import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";

const DiscordCallback: FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { code, error: oauthError } = router.query;
    
    // エラーチェック
    if (oauthError) {
      setError("Discord認証がキャンセルされたか、エラーが発生しました。");
      setLoading(false);
      return;
    }

    // codeが存在しない場合は早期リターン
    if (!code) return;

    const jwt = localStorage.getItem("token");
    if (!jwt) {
      setError("ログインセッションが無効です。再度ログインしてください。");
      setLoading(false);
      return;
    }

    // Discord認証コードをバックエンドに送信
    const connectDiscord = async () => {
      try {
        console.log("Discord連携開始: コード取得済み");
        
        // 環境変数のチェック
        if (!process.env["NEXT_PUBLIC_API_BASEURL"]) {
          throw new Error("API URLが設定されていません");
        }
        
        const redirectUri = `${window.location.origin}/discord-callback`;
        console.log("リダイレクトURI:", redirectUri);
        
        try {
          const response = await axios(`${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/discord/connect`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
            data: {
              code,
              redirectUri,
            },
          });
          
          console.log("Discord連携成功:", response.data);
          
          // 成功したらユーザーページにリダイレクト
          router.push("/user?discord_connected=true");
        } catch (apiErr: any) {
          console.error("API呼び出しエラー:", apiErr);
          
          // エラーレスポンスの詳細を取得
          const errorMessage = apiErr.response?.data?.message || apiErr.message || "不明なエラー";
          const errorStatus = apiErr.response?.status || "不明";
          
          setError(`Discord連携に失敗しました (${errorStatus}): ${errorMessage}`);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Discord連携処理エラー:", err);
        setError(`Discord連携処理中にエラーが発生しました: ${err.message}`);
        setLoading(false);
      }
    };

    connectDiscord();
  }, [router.query, router]);

  return (
    <>
      <Head>
        <title>Discord連携 - 高専LDAP管理システム</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Discord連携処理中
        </h2>

        {error ? (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => router.push("/user")}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
              >
                ユーザーページに戻る
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Discord連携処理中です。しばらくお待ちください...
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DiscordCallback;
