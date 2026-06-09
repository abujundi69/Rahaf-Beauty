import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, keywords, image, url }) {
  const siteName = "RAHAF BEAUTY";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = "تسوقي أفضل منتجات العناية بالبشرة والمكياج والعطور من RAHAF BEAUTY";
  const metaDescription = description || defaultDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={siteName} />
      {image ? <meta property="og:image" content={image} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image ? <meta name="twitter:image" content={image} /> : null}
    </Helmet>
  );
}
