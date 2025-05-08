import ThreadView from '@/components/ThreadView'
import dbConnect from '@/lib/dbConnect'
import Thread from '@/models/Thread'

export default async function ThreadPage({ params }) {
  await dbConnect()
  const thread = await Thread.findOne({ slug: params.slug }).lean()

  return (
    <main className="app-background min-h-screen p-6 text-white max-w-3xl mx-auto">
      <ThreadView thread={JSON.parse(JSON.stringify(thread))} />
    </main>
  )
}
