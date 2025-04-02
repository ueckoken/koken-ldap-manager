import axios from "axios";
import { FC, useEffect, useState } from "react";
import Link from "next/link";

const UserList: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jwt) return;
    const abortController = new AbortController();
    (async () => {
      try {
        const res: any = await axios(
          `${process.env["NEXT_PUBLIC_API_BASEURL"]}/user/list`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            signal: abortController.signal,
          }
        );
        const users = res.data;
        users.forEach((user: any) => {
          user.groups = user.groups.filter(
            (group: string) => group !== "Domain Users"
          );
        });
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      abortController.abort();
    };
  }, [jwt]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="align-middle inline-block min-w-full">
        <div className="shadow overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="table-header">ユーザー名</th>
                <th scope="col" className="table-header">姓</th>
                <th scope="col" className="table-header">名</th>
                <th scope="col" className="table-header">UID</th>
                <th scope="col" className="table-header">GID</th>
                <th scope="col" className="table-header">Discord ID</th>
                <th scope="col" className="table-header">メール</th>
                <th scope="col" className="table-header">電話番号</th>
                <th scope="col" className="table-header">学籍番号</th>
                <th scope="col" className="table-header">グループ</th>
                <th scope="col" className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                  <td className="table-cell font-medium">{user.username}</td>
                  <td className="table-cell">{user.firstName}</td>
                  <td className="table-cell">{user.lastName}</td>
                  <td className="table-cell">{user.uid}</td>
                  <td className="table-cell">{user.gid}</td>
                  <td className="table-cell">{user.discordId}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">{user.telephoneNumber}</td>
                  <td className="table-cell">{user.studentId}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {user.groups.map((group: string) => (
                        <span
                          key={group}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <Link
                      href={"/admin/" + user.username}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
