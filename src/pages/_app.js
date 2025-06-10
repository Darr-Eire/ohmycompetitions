// src/pages/_app.js
import '../../styles/globals.css'; // ✅ keep path relative to project root
import { SessionProvider } from 'next-auth/react'; // ✅ required for useSession
import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <SessionProvider session={session}>
      <PiAuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </PiAuthProvider>
    </SessionProvider>
  );
}
