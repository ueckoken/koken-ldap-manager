import axios from "axios";
import { FC, useEffect, useState } from "react";

const Token: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [token, setToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!jwt) return;
    const abortController = new AbortController();

    (async () => {
      try {
        const res: any = await axios(
          `${process.env["NEXT_PUBLIC_API_BASEURL"]}/token/issue`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            signal: abortController.signal,
          }
        );
        const data = res.data;
        setToken(data.token);
      } catch (err) {
        setError("トークンの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [jwt]); // jwtが変更された時のみ実行

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("クリップボードへのコピーに失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  const registrationUrl = `${process.env["NEXT_PUBLIC_SITE_BASEURL"]}/register?token=${token}`;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          新規登録用トークン
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              トークン
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-mono text-sm">
                {token}
              </code>
              <button
                onClick={() => token && copyToClipboard(token)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="トークンをコピー"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              登録URL
            </label>
            <div className="flex items-center space-x-2">
              <a
                href={registrationUrl}
                className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 break-all"
              >
                {registrationUrl}
              </a>
              <button
                onClick={() => copyToClipboard(registrationUrl)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="URLをコピー"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {copied && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-lg text-sm text-center">
            クリップボードにコピーしました
          </div>
        )}
      </div>
    </div>
  );
};

export default Token;
