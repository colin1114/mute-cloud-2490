import React from 'react';
import ImageUploader from './components/ImageUploader';
import './styles.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          图片上传
        </h1>
        <div className="bg-white rounded-lg shadow-lg">
          <ImageUploader />
        </div>
      </div>
    </div>
  );
};

export default App; 