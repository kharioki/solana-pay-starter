import React from "react";
import Head from "next/head";

export default function HeadComponent() {
  return (
    <Head>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="theme-color" content="#000000" />

      <title>Kiki's Art Store</title>
      <meta name="title" content="Kiki's Art Store" />
      <meta name="description" content="Buy art items on my store using Solana Pay!" />

      {/* Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://kharioki.com/" />
      <meta property="og:title" content="Kiki's Art Store" />
      <meta property="og:description" content="Buy art items on my store using Solana Pay!" />
      <meta property="og:image" content="https://cdn.buildspace.so/courses/solana-pay/metadata.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://kharioki.com/" />
      <meta property="twitter:title" content="Kiki's Art Store" />
      <meta property="twitter:description" content="Buy art items on my store using Solana Pay!" />
      <meta property="twitter:image" content="https://cdn.buildspace.so/courses/solana-pay/metadata.png" />
    </Head>
  );
}
