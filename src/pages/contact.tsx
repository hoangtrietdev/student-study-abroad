import Head from 'next/head';
import Footer from '@/components/Footer';

export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Contact | Study Overseas Map</title>
        <meta name="robots" content="index,follow" />
      </Head>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold mb-4">Contact</h1>
        <p className="mb-4">We’d love to hear from you. Reach us at:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Email: <a className="text-blue-300 underline" href="mailto:hoangtrietdev@gmail.com">hoangtrietdev@gmail.com</a></li>
          <li>Twitter/X: <a className="text-blue-300 underline" href="https://x.com/studyoverseasmap" target="_blank" rel="noopener noreferrer">@studyoverseasmap</a></li>
        </ul>
      </div>
      <Footer />
    </main>
  );
}
