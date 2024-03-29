import axios from "axios";
import { FC, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Link from "next/link";

const UserList: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    if (!jwt) return;
    const abortController = new AbortController();
    (async () => {
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
      console.log(users);
      // remove Domain Users from groups
      users.forEach((user: any) => {
        user.groups = user.groups.filter(
          (group: string) => group !== "Domain Users"
        );
      });
      setUsers(users);
    })();
    return () => {
      abortController.abort();
    };
  }, [jwt]);

  return (
    <>
      <Table striped>
        <thead>
          <tr>
            <th>username</th>
            <th>firstName</th>
            <th>lastName</th>
            <th>uid</th>
            <th>gid</th>
            <th>discordId</th>
            <th>email</th>
            <th>phoneNumber</th>
            <th>studentId</th>
            <th>groups</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.username}>
              <td>{user.username}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.uid}</td>
              <td>{user.gid}</td>
              <td>{user.discordId}</td>
              <td>{user.email}</td>
              <td>{user.telephoneNumber}</td>
              <td>{user.studentId}</td>
              <td>{user.groups.join(", ")}</td>
              <td>
                <Link href={"/admin/" + user.username}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default UserList;
