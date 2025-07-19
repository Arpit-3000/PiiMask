import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult('');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult('');
    }
  };

  const cleanOCRText = (text) => {
    return text
      .replace(/[\u2022\u25aa\u25e6\u25cf\u2023\u2013\u2014\-](?=\s)/g, '') 
      .replace(/[^\w\s\(\)\.\,\:\;\-\+\=\>\<\[\]\{\}\/\\'\"@\#\&\%\*\!\?\|\_\n\u0900-\u097F]/g, '') 
      .replace(/\n{2,}/g, '\n') 
      .replace(/\s{2,}/g, ' ') 
      .trim();
  };

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);
    setResult('');
    setProgress(0);

    try {
      const { data: { text } } = await Tesseract.recognize(image, 'eng+hin', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const cleanedText = cleanOCRText(text);
      setResult(cleanedText || 'No text found.');
    } catch (err) {
      console.error(err);
      setResult('❌ Error extracting text');
    }
    setLoading(false);
    setProgress(0);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center px-2 py-6 sm:px-4 lg:px-8 transition-all duration-300 font-sans">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-indigo-400 to-yellow-400 mb-10 text-center leading-tight drop-shadow-[0_4px_24px_rgba(236,72,153,0.4)] tracking-tight font-display select-none">
        🪄 PII Mask OCR Extractor
      </h1>

      <div
        className={`w-full max-w-2xl border-4 border-dashed p-6 sm:p-10 rounded-2xl bg-white/10 backdrop-blur-lg text-center mb-10 shadow-2xl hover:shadow-pink-400/30 transition-all duration-300 cursor-pointer border-pink-400/60 hover:border-indigo-400/80 group relative
        ${loading ? 'opacity-70 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !loading && fileInputRef.current.click()}
      >
        <div className="absolute inset-0 pointer-events-none rounded-2xl group-hover:shadow-[0_0_40px_10px_rgba(236,72,153,0.15)] transition-all duration-300" />
        <p className="text-pink-200 font-semibold text-lg mb-1 tracking-wide">Drag & Drop</p>
        <p className="text-gray-300 text-sm mb-2">or click to select an image file</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          ref={fileInputRef}
          disabled={loading}
        />
        <div className="flex justify-center mt-4">
          <span className="inline-block animate-bounce text-pink-400/60 text-2xl">↓</span>
        </div>
      </div>

      {(preview || result) && (
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10 items-stretch justify-center mb-10">
          
          {preview && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-3xl shadow-[0_8px_32px_0_rgba(236,72,153,0.25)] border-2 border-pink-400/60 flex items-center justify-center overflow-hidden relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain transition-all duration-300 drop-shadow-[0_4px_32px_rgba(236,72,153,0.25)]"
                  style={{ background: "#222" }}
                />
                <div className="absolute inset-0 pointer-events-none rounded-3xl border-2 border-white/10" />
              </div>
            </div>
          )}

         
          {result && (
            <div className="flex-1 flex flex-col items-end">
              <h2 className="text-xl font-semibold text-pink-200 mb-3 text-right tracking-wide">
                📝 Extracted Text
              </h2>
              <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
                <textarea
                  className="bg-white/10 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-2xl border-l-4 border-pink-400/70 text-base text-pink-100 font-mono h-full w-full resize-none focus:outline-none transition-all duration-200"
                  value={result}
                  readOnly
                  style={{ minHeight: "100%", maxHeight: "100%" }}
                />
                <button
                  onClick={handleDownload}
                  className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 via-indigo-500 to-yellow-400 hover:from-indigo-600 hover:to-pink-400 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-200 text-xs font-semibold tracking-wide ring-2 ring-pink-400/30 hover:ring-indigo-400/50"
                >
                  Download Text
                </button>
              </div>
            </div>
          )}
        </div>
      )}

     
      {loading && (
        <div className="w-full max-w-xs mt-8">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-indigo-400 to-yellow-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-pink-200 mt-1 text-right font-mono">{progress}%</div>
        </div>
      )}

    
      <button
        onClick={handleExtract}
        disabled={loading || !image}
        className={`w-full max-w-xs py-3 px-6 rounded-2xl text-white font-bold text-lg shadow-lg transition duration-200 mt-10
          bg-gradient-to-r from-pink-500 via-indigo-500 to-yellow-400 hover:from-indigo-600 hover:to-pink-400
          ${loading || !image ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}
        `}
        style={{ letterSpacing: "0.03em" }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Extracting Text...
          </span>
        ) : 'Extract Text'}
      </button>
    </div>
  );
}

export default App;