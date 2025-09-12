import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624818853225101"
          crossOrigin="anonymous"
        />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="Study Overseas Map - Complete Study Abroad Roadmap & Guide" />
        <meta name="description" content="Interactive study abroad roadmap for international students. Plan your journey with our comprehensive guide covering university applications, visas, scholarships, and more." />
        <meta name="keywords" content="study abroad, overseas education, international students, university applications, student visa, study abroad roadmap, international education guide, study overseas, global education" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Study Overseas Map" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://studyoverseasmap.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://studyoverseasmap.com" />
        <meta property="og:title" content="Study Overseas Map - Your Complete Study Abroad Guide" />
        <meta property="og:description" content="Interactive roadmap and AI assistant to help international students plan their study abroad journey. Get guidance on applications, visas, scholarships, and more." />
        <meta property="og:image" content="https://studyoverseasmap.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Study Overseas Map" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://studyoverseasmap.com" />
        <meta property="twitter:title" content="Study Overseas Map - Complete Study Abroad Roadmap" />
        <meta property="twitter:description" content="Interactive roadmap and AI assistant for international students planning to study abroad." />
        <meta property="twitter:image" content="https://studyoverseasmap.com/og-image.png" />
        <meta property="twitter:creator" content="@studyoverseasmap" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon-16x16.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/favicon-32x32.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        
        {/* PWA Icons */}
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icon-512x512.svg" />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
