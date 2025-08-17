import '../../styles/globals.css';
import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  const getLayout =
    Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <PiAuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
