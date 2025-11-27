import React, { useState } from 'react';

const OcrOutput = ({ text, isProcessing }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Processing your image...</p>
        </div>
      );
    }

    if (!text) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="text-4xl mb-4">📄</div>
          <p>Extracted text will appear here</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{text}</pre>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
          >
            {copied ? '✓ Copied!':(
              <>
              <div className="flex items-center justify-center gap-2">
                <img src="/copy_button.jpg" alt="Copy Icon" className="w-5 h-5 object-contain" />
                <span>Copy</span>
              </div>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
          >
            <div className="flex items-center justify-center gap-2">
              <img src="/download_button.jpg" alt="Download Icon" className="w-5 h-5 object-contain" />
              <span>Download</span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <span className="mr-2">📄</span>
          Extracted Text
        </h3>
        {text && (
          <span className="text-sm text-gray-500">{text.length} chars</span>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
};

export default OcrOutput;