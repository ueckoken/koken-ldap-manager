import { FC, FormEvent, useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";

const LoginPage: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res: any = await axios(
        `${process.env["NEXT_PUBLIC_API_BASEURL"]}/auth/login`,
        {
          method: "POST",
          data: {
            username: userId,
            password: password,
          },
        }
      );

      if (res.data.httpCode && res.data.httpCode !== 200) {
        setError(res.data.message || "ログインに失敗しました");
        return;
      }

      const token = res.data.token;
      setJwt(token);
      localStorage.setItem("token", token);
      window.location.href = "/";
    } catch (err: any) {
      setError(
        err.response?.data?.message || "ログインに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ログイン - Koken LDAP Manager</title>
      </Head>

      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
              ログイン
            </h2>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="space-y-6">
                <div>
                  <label htmlFor="userId" className="form-label">
                    ユーザーID
                  </label>
                  <input
                    id="userId"
                    type="text"
                    required
                    className="input-field"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="form-label">
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                ログイン
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
