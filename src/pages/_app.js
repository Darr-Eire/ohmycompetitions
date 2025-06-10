import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';
import '../../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <PiAuthProvider>
      <Component {...pageProps} />
    </PiAuthProvider>
  );
}

