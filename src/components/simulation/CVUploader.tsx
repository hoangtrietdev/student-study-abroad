import { useRef, useState } from 'react';

interface CVUploaderProps {
  onExtracted: (profile: import('@/types/simulation').ExtractedProfile, fileName: string) => void;
}

export default function CVUploader({ onExtracted }: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('[PDF] Dynamically importing pdfjs-dist (bypassing Webpack)...');
      // By using webpackIgnore: true, Next.js ignores this. The browser
      // loads /pdf.min.mjs natively, sidestepping the Object freeze issue.
      // @ts-expect-error - TS doesn't resolve absolute paths to the public directory
      const pdfjsLib = await import(/* webpackIgnore: true */ '/pdf.min.mjs');
      console.log('[PDF] pdfjsLib loaded successfully');
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      console.log('[PDF] Reading file into ArrayBuffer...');
      const arrayBuffer = await file.arrayBuffer();
      
      console.log('[PDF] Parsing document...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      console.log(`[PDF] Document parsed successfully, ${pdf.numPages} pages.`);
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`[PDF] Extracting text from page ${i}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n';
      }

      console.log('[PDF] Extraction complete. Total characters:', fullText.length);
      return fullText.trim();
    } catch (err) {
      console.error('[PDF] Error in extractTextFromPDF:', err);
      throw err;
    }
  }

  async function processFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported. Please upload a PDF of your CV.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setFileName(file.name);

    try {
      const cvText = await extractTextFromPDF(file);
      if (cvText.length < 50) {
        throw new Error('Could not extract readable text from this PDF. Please try a text-based PDF (not a scanned image).');
      }

      const res = await fetch('/api/simulation/extract-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to extract CV data.');

      onExtracted(data.profile, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed
          transition-all duration-300 cursor-pointer select-none
          min-h-64 p-10
          ${isDragging
            ? 'border-blue-400 bg-blue-900/20 scale-[1.02]'
            : 'border-gray-600 bg-gray-800/60 hover:border-blue-500 hover:bg-gray-800'
          }
          ${isLoading ? 'cursor-not-allowed opacity-75' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
        />

        {isLoading ? (
          <>
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <p className="text-gray-300 font-medium text-center">
              Extracting your CV data with AI…
              <br />
              <span className="text-sm text-gray-500">This takes about 10–20 seconds</span>
            </p>
          </>
        ) : (
          <>
            {/* Upload icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-blue-500/20' : 'bg-gray-700'}`}>
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-white mb-1">
                {isDragging ? 'Drop your CV here' : 'Upload your CV'}
              </p>
              <p className="text-sm text-gray-400">
                Drag & drop a PDF file here, or{' '}
                <span className="text-blue-400 underline underline-offset-2">click to browse</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">PDF only · Max 10 MB · Text stays on your device</p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {['Skills extracted', 'Education parsed', 'Certificates found', 'Connections identified'].map((f) => (
                <span key={f} className="text-xs px-3 py-1 rounded-full bg-gray-700 text-gray-300">✓ {f}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {fileName && !error && !isLoading && (
        <div className="mt-4 p-3 rounded-xl bg-green-900/20 border border-green-700 text-green-300 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Uploaded: <strong>{fileName}</strong></span>
        </div>
      )}
    </div>
  );
}
