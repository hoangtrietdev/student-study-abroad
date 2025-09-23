import Head from 'next/head';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-gray-900 text-gray-100">
      <Head>
        <title>Privacy Policy | Study Overseas Map</title>
        <meta name="robots" content="index,follow" />
      </Head>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-3 opacity-90">Last updated: {new Date().toLocaleDateString()}</p>

        <p className="mb-4">
          We value your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use Study Overseas Map.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Account information you provide (e.g., email) if you sign in.</li>
          <li>Usage data such as pages visited and interactions, collected via analytics.</li>
          <li>Chat inputs you provide to our AI assistant for the purpose of generating responses.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Information</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>To provide, maintain, and improve our services and features.</li>
          <li>To respond to your requests and provide support.</li>
          <li>To comply with legal obligations and enforce our terms.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Advertising and Cookies</h2>
        <p className="mb-3">
          We display ads served by Google AdSense. Google may use cookies and/or local storage to serve ads based on prior visits. You can learn more and manage your preferences at
          {' '}<a href="https://policies.google.com/technologies/ads" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">Google’s Advertising Policies</a> and
          {' '}<a href="https://adssettings.google.com" className="text-blue-300 underline" target="_blank" rel="noopener noreferrer">Ads Settings</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Data Sharing</h2>
        <p className="mb-3">We do not sell personal information. We may share limited data with service providers (e.g., hosting, analytics, AI model providers) under appropriate safeguards.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">International Transfers</h2>
        <p className="mb-3">Your data may be processed in countries other than your own, with appropriate protections in place.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Your Choices</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Disable cookies in your browser settings (may affect functionality).</li>
          <li>Opt out of personalized ads via <a className="text-blue-300 underline" target="_blank" rel="noopener noreferrer" href="https://adssettings.google.com">Google Ads Settings</a>.</li>
          <li>Contact us to request deletion of your account data where applicable.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p>Questions? Email us at <a href="mailto:hoangtrietdev@gmail.com" className="text-blue-300 underline">hoangtrietdev@gmail.com</a>.</p>
      </div>
      <Footer />
    </main>
  );
}
