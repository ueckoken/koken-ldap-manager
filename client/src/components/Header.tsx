import { FC, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import Link from "next/link";

const Header: FC<{}> = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [jwtData, setJwtData] = useState<any>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    if (!jwt) return;
    const decoded: any = jwt_decode(jwt);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem("token");
      setJwt(null);
      window.location.href = "/";
    }
  });

  const onClickLogout = () => {
    setJwt(null);
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                alt="Logo"
                src="/logo.svg"
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                KokenLdapManager
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {!jwt ? (
              <Link
                href="/login"
                className="btn-primary"
              >
                ログイン
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  <span>{jwtData.uid}</span>
                  <svg
                    className={`h-5 w-5 transform transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
                    <Link
                      href="/user"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      ユーザー設定
                    </Link>
                    <Link
                      href="/update"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      更新届提出
                    </Link>
                    {jwtData.groups?.includes("manager") && (
                      <>
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          ユーザー管理
                        </Link>
                        <Link
                          href="/token"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          新規登録用Token
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-600" />
                    <button
                      onClick={onClickLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
