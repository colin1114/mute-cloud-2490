import React, { useCallback, useState } from 'react';

const ImageUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const { url } = await response.json();
          setUploadedImages(prev => [...prev, url]);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.files;
    if (items) {
      handleUpload(items);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className="p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="fileInput"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          选择图片
        </label>
        <p className="mt-2 text-gray-500">
          或将图片拖放到此处，也可以使用 Ctrl+V 粘贴图片
        </p>
      </div>

      {isUploading && (
        <div className="mt-4 text-center text-blue-500">
          正在上传...
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 