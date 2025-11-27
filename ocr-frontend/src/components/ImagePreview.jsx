import React, { useState, useEffect } from 'react';

const ImagePreview = ({ image, onProcess, onReset, isProcessing, progress }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <img src="/preview_button.jpg" alt="Preview Icon" className="w-6 h-6 mr-2" />
          Preview
        </h3>
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50"
        >
          ✕
        </button>
      </div>

      {/* Image Display */}
      <div className="mb-4">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-48 object-contain bg-gray-50 rounded-lg border"
        />
      </div>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
        <div className="font-medium">{image.name}</div>
        <div>{(image.size / 1024 / 1024).toFixed(2)} MB</div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
            isProcessing
              ? 'bg-gray-200 text-gray-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
          }`}
        >
          {isProcessing ? ( 
          'Processing...' 
          ):(
            <div className="flex items-center justify-center gap-2">
              <img src="/search_button.jpg" alt="Search Icon" className="w-5 h-5 object-contain" />
              <span>Extract Text</span>
            </div>
            
          )}
        </button>
        
        <button
          onClick={onReset}
          className="py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          <img src="/reset_button.jpg" alt="Reset Icon" className="w-5 h-5 object-contain" />
          <span>Reset</span>
        </button>

      </div>
    </div>
  );
};

export default ImagePreview;