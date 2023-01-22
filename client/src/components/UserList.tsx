import axios from "axios";
import { FC, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import jwt_decode from "jwt-decode";

const UserList: FC<{ jwt: string | null }> = ({ jwt }) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!jwt) return;
    const decoded: any = jwt_decode(jwt);
    console.log(decoded);
    if (!decoded.groups.includes("manager")) {
      alert("You are not admin");
      window.location.href = "/user";
    }
  })

  useEffect(() => {
    if (!jwt) return;
    (async () => {
      const res: any = await axios("http://localhost:8000/user/list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      const users = res.data;
      console.log(users);
      // remove Domain Users from groups
      users.forEach((user: any) => {
        user.groups = user.groups.filter((group: string) => group !== "Domain Users");
      });
      setUsers(users);
    })();
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
              <td>{user.groups.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default UserList;