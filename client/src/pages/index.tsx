import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { Button, Container } from 'react-bootstrap'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Container className="pt-3">
        <h1>Koken LDAP Manager</h1>
        <p>工研統合認証に使用するアカウントのパスワード変更や情報の変更を行えます。</p>

        <h5>Koken統合認証について</h5>
        Koken統合認証は工研の提供する工研の以下のようなサービスを一括して認証するためのものです。
        <ul>
          <li>Koken Wiki</li>
          <li>Discrodロール認証</li>
          <li>部室Wifi</li>
          <li>NAS</li>
          <li>サーバー</li>
          <li>etc...</li>
        </ul>

        <h5>KLMアカウント発行について</h5>
        <ul>
          <li><b>既に工研部員の方</b></li>
          <a href="https://wiki.koken.club.uec.ac.jp">Koken Wiki</a>に記載してある手順に従ってアカウントを発行してください。
          <li><b>新しく入部した方</b></li>
          入部届を提出するとアカウント登録が行えるURLが記載されたメールが届きます。メールに記載されている手順に従ってアカウントを発行してください。
        </ul>
      </Container>
    </>
  )
}
