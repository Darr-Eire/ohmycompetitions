// pages/index.js
import Head from 'next/head';
import PiLoginButton from '../src/components/PiLoginButton';

export default function Home() {
  return (
    <>
      <Head>
        <title>My Pi App</title>
        {/* Make sure you’ve included the SDK init in your <Head> */}
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `Pi.init({ version: "2.0" });`,
          }}
        />
      </Head>

      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to My Pi App</h1>
          <PiLoginButton />
        </div>
      </main>
    </>
  );
}
