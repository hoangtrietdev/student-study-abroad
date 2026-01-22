import Head from 'next/head';
import MainLayout from '@/components/layout/MainLayout';

export default function Terms() {
  return (
    <MainLayout title="Terms of Service">
      <Head>
        <title>Terms of Service | Study Overseas Map</title>
        <meta name="robots" content="index,follow" />
      </Head>
      <main className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-4 opacity-90">Last updated: {new Date().toLocaleDateString()}</p>

        <p className="mb-3">
          By accessing or using Study Overseas Map, you agree to these Terms. If you do not agree, do not use the site.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Use of the Service</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>You will not use the site for unlawful purposes or to violate others’ rights.</li>
          <li>You are responsible for content you submit in the AI chat and agree it may be moderated.</li>
          <li>We may update, suspend, or discontinue features at any time.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">AI Assistant Disclaimer</h2>
        <p className="mb-3">AI outputs may be inaccurate or incomplete. Always verify important information with official sources.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Intellectual Property</h2>
        <p className="mb-3">All content is owned by us or our licensors. You may not copy, modify, or redistribute without permission.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
        <p className="mb-3">To the extent permitted by law, we are not liable for indirect or consequential damages arising from your use of the site.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p>Questions? Email <a href="mailto:hoangtrietdev@gmail.com" className="text-blue-300 underline">hoangtrietdev@gmail.com</a>.</p>
      </div>
    </main>
    </MainLayout>
  );
}
