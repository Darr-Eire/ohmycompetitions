// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends React.Component {
  render() {
    return (
      <Html>
        <Head>
          {/* Pi SDK loader */}
          <script
            async
            src="https://sdk.minepi.com/pi.js"
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
