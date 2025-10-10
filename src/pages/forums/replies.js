// pages/forums/replies.js
import axios from 'axios'
import loadNamespaces from 'next-translate/loadNamespaces'
import { useRouter } from 'next/router'

export async function getServerSideProps(context) {
  const { locale, query } = context
  const threadId = query.threadId || ''

  if (!threadId) {
    return { notFound: true }
  }

  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/forums/replies?threadId=${threadId}`)
    return {
      props: {
        replies: res.data,
        ...(await loadNamespaces({ locale, pathname: '/forums/replies' })),
      },
    }
  } catch (err) {
    return {
      props: {
        replies: [],
        ...(await loadNamespaces({ locale, pathname: '/forums/replies' })),
      },
    }
  }
}

export default function RepliesPage({ replies }) {
  const router = useRouter()

  return (
    <div>
      <h1>Replies for Thread: {router.query.threadId}</h1>
      {replies.length === 0 && <p>No replies yet</p>}
      <ul>
        {replies.map((reply) => (
          <li key={reply._id}>
            <p>{reply.content}</p>
            <small>{new Date(reply.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
