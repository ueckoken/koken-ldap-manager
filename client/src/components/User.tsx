import axios from "axios";
import router from "next/router";
import { FC, useEffect, useState } from "react";
import DiscordOAuth from "./DiscordOAuth";

const User: FC<{
  jwt: string | null;
  isAdmin: boolean;
  targetUser: string | null;
}> = ({ jwt, isAdmin, targetUser }) => {
  const [firstName, setfirstName] = useState<string>("");
  const [lastName, setlastName] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [gid, setGid] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [groups, setGroups] = useState<string[]>([]);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [definedGroups, setDefinedGroups] = useState<string[]>([]);
  const [phonenumber, setPhonenumber] = useState<string>("");
  const [studentid, setStudentid] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!jwt) return;
    const abortController = new AbortController();
    (async () => {
      try {
        const res0: any = await axios(
          `${process.env["NEXT_PUBLIC_API_BASEURL"]}/group/list`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            signal: abortController.signal,
          }
        );
        let data0 = res0.data;
        data0 = data0.filter((group: string) => group !== "Domain Users");
        setDefinedGroups(data0);
        
        const res: any = await axios(
          isAdmin
            ? `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile/${targetUser}`
            : `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            signal: abortController.signal,
          }
        );
        const data = res.data;
        data.groups = data.groups.filter(
          (group: string) => group !== "Domain Users"
        );
        setUsername(data.username);
        setfirstName(data.firstName);
        setlastName(data.lastName);
        setUid(data.uid);
        setGid(data.gid);
        setDiscordId(data.discordId);
        setGroups(data.groups);
        setEmail(data.email);
        setPhonenumber(data.telephoneNumber);
        setStudentid(data.studentId);
      } catch (err) {
        setError("ユーザー情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [jwt, isAdmin, targetUser]);

  const updateUserInfo = async () => {
    if (!jwt) return;
    setError("");

    if (password !== "") {
      if (password !== confirmPassword) {
        setError("パスワードが一致しません");
        return;
      }
      if (password.length < 6) {
        setError("パスワードは6文字以上にしてください");
        return;
      }
      if (password.length > 90) {
        setError("パスワードは90文字以下にしてください");
        return;
      }
    }

    try {
      await axios(
        isAdmin
          ? `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile/${targetUser}`
          : `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
          data: {
            firstName,
            lastName,
            discordId,
            email,
            groups,
            telephoneNumber: phonenumber,
            studentId: studentid,
          },
        }
      );

      if (password) {
        await axios(
          isAdmin
            ? `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/password/${targetUser}`
            : `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/password`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            data: {
              password,
            },
          }
        );
      }

      alert("ユーザー情報を更新しました");
      if (isAdmin) {
        router.push("/admin/" + targetUser);
      } else {
        router.push("/user");
      }
    } catch (err) {
      setError("ユーザー情報の更新に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        ユーザー情報
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="form-label">UID</label>
              <input
                type="text"
                value={uid}
                disabled
                className="input-field bg-gray-100"
              />
            </div>
            <div>
              <label className="form-label">GID</label>
              <input
                type="text"
                value={gid}
                disabled
                className="input-field bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="form-label">グループ</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {definedGroups.map((group: string) => (
                <label
                  key={group}
                  className="inline-flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    disabled={!isAdmin}
                    checked={groups.includes(group)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGroups([...groups, group]);
                      } else {
                        setGroups(groups.filter((g: string) => g !== group));
                      }
                    }}
                    className="form-checkbox h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{group}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">ユーザー名</label>
            <input
              type="text"
              value={username}
              disabled
              className="input-field bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="form-label">姓</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setfirstName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">名</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setlastName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Discord ID</label>
            <input
              type="text"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              className="input-field"
              placeholder="Discord IDを入力するか、Discordと連携してください"
            />
            <DiscordOAuth
              jwt={jwt}
              discordId={discordId}
              setDiscordId={setDiscordId}
            />
          </div>

          <div>
            <label className="form-label">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">電話番号（ハイフンなし）</label>
            <input
              type="text"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">学籍番号</label>
            <input
              type="text"
              value={studentid}
              onChange={(e) => setStudentid(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">
              パスワード（6文字以上90文字以下）
            </label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">パスワード（確認用）</label>
            <input
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            onClick={updateUserInfo}
            className="btn-primary w-full"
          >
            更新
          </button>
        </div>
      </div>
    </div>
  );
};

export default User;
