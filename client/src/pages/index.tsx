import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Koken LDAP Manager</title>
        <meta name="description" content="工研統合認証アカウント管理システム" />
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Koken LDAP Manager
        </h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          工研統合認証に使用するアカウントのパスワード変更や情報の変更を行えます。
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Koken統合認証について
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Koken統合認証は工研の提供する工研の以下のようなサービスを一括して認証するためのものです。
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Koken Wiki</li>
            <li>Discordロール認証</li>
            <li>部室Wifi</li>
            <li>NAS</li>
            <li>サーバー</li>
            <li>etc...</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            KLMアカウント発行について
          </h2>
          <ul className="space-y-6">
            <li className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                既に工研部員の方
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                <a 
                  href="https://wiki.koken.club.uec.ac.jp" 
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Koken Wiki
                </a>
                に記載してある手順に従ってアカウントを発行してください。
              </p>
            </li>
            <li className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                新しく入部した方
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                入部届を提出するとアカウント登録が行えるURLが記載されたメールが届きます。メールに記載されている手順に従ってアカウントを発行してください。
              </p>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
