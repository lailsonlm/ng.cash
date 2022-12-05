import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt">
      <title>NG.CASH - A carteira digital do futuro.</title>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

        <meta name="theme-color" content="#000" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#000" />

        <meta property="og:description" content="NG.CASH - A carteira digital do futuro." />
        <meta name="description" content="NG.CASH - A carteira digital do futuro."  />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />

        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}