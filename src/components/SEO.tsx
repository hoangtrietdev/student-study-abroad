import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const SEO = ({
  description = "Interactive study abroad roadmap for international students. Plan your journey with our comprehensive guide covering university applications, visas, scholarships, and more.",
  keywords = "study abroad, overseas education, international students, university applications, student visa, study abroad roadmap, international education guide, study overseas, global education",
  image = "/api/og-image",
  url = "https://studyoverseasmap.com",
  type = "website",
  noindex = false,
}: SEOProps) => {
  const siteTitle = `Interactive Study Abroad Roadmap`;

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Study Overseas Roadmap - Interactive AI-powered guidance platform for international students" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Study Overseas Map" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={url} />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Study Overseas Map",
            "description": description,
            "url": url,
            "image": image,
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "Study Overseas Map",
              "url": "https://studyoverseasmap.com"
            },
            "keywords": keywords.split(', '),
            "inLanguage": ["en", "vi"],
            "audience": {
              "@type": "Audience",
              "audienceType": "International Students"
            }
          })
        }}
      />
    </Head>
  );
};

export default SEO;
