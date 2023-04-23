import { FC, useEffect, useState } from "react";
import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import jwt_decode from "jwt-decode";

const Header: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [jwtData, setJwtData] = useState<any>("");

  useEffect(() => {
    if (!jwt) return;
    const decoded: any = jwt_decode(jwt);
    setJwtData(decoded);
  }, [jwt]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setJwt(token);
  }, []);

  useEffect(() => {
    // remove from localStrorage if jwt expired
    if (!jwt) return;
    const decoded: any = jwt_decode(jwt);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      setJwt(null);
      // redirect to home
      window.location.href = "/";
    }
  });

  const onClickLogout = () => {
    setJwt(null);
    localStorage.removeItem("token");
    // redirect to home
    window.location.href = "/";
  };

  return (
    <header>
      <Navbar bg="light" variant="light">
        <Container fluid>
          <Navbar.Brand href="/">
            <img
              alt=""
              src="/logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{" "}
            KokenLdapManager
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            {!jwt && <Nav.Link href="/login">Login</Nav.Link>}
            {jwtData && jwt && (
              <NavDropdown title={jwtData.uid} align="end">
                <NavDropdown.Item href="/user">ユーザー設定</NavDropdown.Item>
                {jwtData.groups.includes("manager") && (
                  <NavDropdown.Item href="/admin">
                    ユーザー管理
                  </NavDropdown.Item>
                )}
                {jwtData.groups.includes("manager") && (
                  <NavDropdown.Item href="/token">
                    新規登録用Token
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={onClickLogout}>
                  ログアウト
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
