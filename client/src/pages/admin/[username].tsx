import User from '@/components/User';
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';

const UserEdit = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    setJwt(token)
  }, [jwt])
  const router = useRouter()
  const { username } = router.query

  return (
    <>
      {username &&
        < User jwt={jwt} isAdmin={true} targetUser={String(username)} />
      }
    </>
  )
}

export default UserEdit