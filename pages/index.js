// pages/index.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import PiLoginButton from '../src/components/PiLoginButton';

export default function Home() {
  const router = useRouter();

  const onLoginSuccess = () => {
    router.push('/account');
  };

  return (
    <>
      <Head>
        <title>My Pi App</title>
        <script src="https://sdk.minepi.com/pi-sdk.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `Pi.init({ version: "2.0", sandbox: ${process.env.NODE_ENV !== 'production'} });`,
          }}
        />
      </Head>

      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to My Pi App</h1>
          <PiLoginButton onSuccess={onLoginSuccess} />
        </div>
      </main>
    </>
  );
}
