import "../styles/globals.css";
import WalletProvider from "../components/WalletProvider";

export default function App({ Component, pageProps }) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
