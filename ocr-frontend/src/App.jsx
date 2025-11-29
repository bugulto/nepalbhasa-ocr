import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ImagePreview from './components/ImagePreview';
import OcrOutput from './components/OcrOutput';
import './index.css';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [ocrEngine, setOcrEngine] = useState('easyocr'); 

  const handleImageUpload = (file) => {
    setUploadedImage(file);
    setExtractedText('');
    setProgress(0);
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setExtractedText('');
    setProgress(0);

    const formData = new FormData();
    formData.append('image', uploadedImage);
    formData.append('ocr_engine', ocrEngine);

    try {
      const response = await fetch('http://localhost:8000/ocr/', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Request failed with status: ${response.status}`;
        const errorDetails = data.details || data.stderr || 'No further details provided.';
        console.error('Server Error:', errorMessage, errorDetails);
        setExtractedText(`Error: ${errorMessage}\n\nDetails:\n${errorDetails}`);
      } else {
        setExtractedText(data.predicted_text || 'No text was extracted.');
        console.log('Confidence:', data.confidence);
        console.log('CER:', data.cer);
      }
    } catch (error) {
      console.error('API Call Failed:', error);
      setExtractedText('Network Error: Could not connect to the OCR service. Please ensure the backend server is running and accessible.');
    } finally {
      setIsProcessing(false);
      setProgress(100); 
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setExtractedText('');
    setProgress(0);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <img src="\project_logo.png" alt="Logo" className="w-full h-full object-cover"/>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-600">Nepalbhasa OCR</h1>
                <p className="text-sm text-gray-600">Unlock Words from Images ✨</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            
            {/* OCR Engine Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <label htmlFor="ocr-engine" className="block text-lg font-semibold text-gray-700 mb-2">
                    Choose OCR Engine
                </label>
                <select 
                    id="ocr-engine"
                    value={ocrEngine}
                    onChange={(e) => setOcrEngine(e.target.value)}
                    disabled={isProcessing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                    <option value="easyocr">EasyOCR Model</option>
                    <option value="paddleocr">PaddleOCR Model</option>
                    <option value="calamari">Calamari Model</option>
                    <option value="tesseract">Tesseract</option>                    
                </select>
            </div>

            <FileUpload onImageUpload={handleImageUpload} />
            
            {uploadedImage && (
              <ImagePreview
                image={uploadedImage}
                onProcess={handleProcessImage}
                onReset={handleReset}
                isProcessing={isProcessing}
                progress={progress}
              />
            )}
          </div>
          <OcrOutput text={extractedText} isProcessing={isProcessing} />
        </div>
      </main>
    </div>
  );
}

export default App;