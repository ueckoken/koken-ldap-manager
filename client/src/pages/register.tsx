import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";

export default function RegisterPage() {
  const router = useRouter();
  const token = router.query.token;
  const usernameQuery = router.query.username;
  const firstnameQuery = router.query.firstname;
  const lastnameQuery = router.query.lastname;
  const emailQuery = router.query.email;
  const discordIdQuery = router.query.discordid;
  const studentidQuery = router.query.studentid;
  const phonenumberQuery = router.query.phonenumber;

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [studentid, setStudentId] = useState<string>("");
  const [phonenumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const abortController = new AbortController();
    (async () => {
      try {
        const res = await axios(
          `${process.env["NEXT_PUBLIC_API_BASEURL"]}/token/verify?token=${token}`,
          {
            method: "GET",
            signal: abortController.signal,
          }
        );
        
        if (!res.data.valid) {
          setError("無効なトークンです");
          router.push("/");
          return;
        }

        if (usernameQuery) setUsername(usernameQuery as string);
        if (firstnameQuery) setFirstName(firstnameQuery as string);
        if (lastnameQuery) setLastName(lastnameQuery as string);
        if (emailQuery) setEmail(emailQuery as string);
        if (discordIdQuery) setDiscordId(discordIdQuery as string);
        if (studentidQuery) setStudentId(studentidQuery as string);
        if (phonenumberQuery) setPhoneNumber(phonenumberQuery as string);
      } catch (err) {
        setError("トークンの検証に失敗しました");
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [token]);

  const checkPassword = (password: string) => {
    if (password.length < 6) {
      setError("パスワードは6文字以上にしてください");
      return false;
    }
    if (password.length > 90) {
      setError("パスワードは90文字以下にしてください");
      return false;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return false;
    }
    return true;
  };

  const onClickRegister = async () => {
    setError("");
    if (!checkPassword(password)) return;
    setLoading(true);

    try {
      const res = await axios(
        `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/register/token`,
        {
          method: "POST",
          data: {
            username,
            password,
            firstName,
            lastName,
            email,
            discordId,
            phonenumber,
            studentid,
            token,
          },
        }
      );

      if (res.data.httpCode && res.data.httpCode !== 200) {
        setError(res.data.message);
        return;
      }

      alert("登録が完了しました");
      router.push("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>アカウント登録 - Koken LDAP Manager</title>
      </Head>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          アカウント登録
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="username" className="form-label">
              ユーザー名（変更不可）
            </label>
            <input
              id="username"
              type="text"
              className="input-field"
              placeholder="takumikentaro"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              既に使用されているユーザー名は使えません
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="form-label">
                姓
              </label>
              <input
                id="firstName"
                type="text"
                className="input-field"
                placeholder="工研"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">
                名
              </label>
              <input
                id="lastName"
                type="text"
                className="input-field"
                placeholder="太郎"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="studentid" className="form-label">
              学籍番号
            </label>
            <input
              id="studentid"
              type="text"
              className="input-field"
              placeholder="2110000"
              value={studentid}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phonenumber" className="form-label">
              電話番号（ハイフンなし）
            </label>
            <input
              id="phonenumber"
              type="text"
              className="input-field"
              placeholder="07012345678"
              value={phonenumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="discordId" className="form-label">
              Discord ID
            </label>
            <input
              id="discordId"
              type="text"
              className="input-field"
              placeholder="kokenuser#1962"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="ueckoken@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">
              パスワード（6文字以上90文字以下）
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              パスワード（確認用）
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={onClickRegister}
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center"
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
            登録
          </button>
        </div>
      </div>
    </>
  );
}
