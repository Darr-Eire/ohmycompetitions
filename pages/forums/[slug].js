import dbConnect from 'lib/dbConnect'
import Thread from '@models/Thread'


import ThreadView from '@components/ThreadView'

export default function ThreadPage({ thread }) {
  return (
    <main className="app-background min-h-screen p-6 text-white max-w-3xl mx-auto">
      <ThreadView thread={thread} />
    </main>
  )
}

export async function getServerSideProps(context) {
  const { slug } = context.params

  await dbConnect()

  const thread = await Thread.findOne({ slug }).lean()

  if (!thread) {
    return { notFound: true }
  }

  return {
    props: {
      thread: JSON.parse(JSON.stringify(thread))
    }
  }
}
