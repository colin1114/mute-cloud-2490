import React, { useCallback, useState } from 'react';

// 配置常量
const CONFIG = {
  UPLOAD_API_PATH: '/api/upload'
} as const;

interface UploadedImage {
  url: string;
  timestamp: number;
}

const ImageUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 可以添加一个临时提示，但这里我们保持简单
      console.log('Copied to clipboard');
    });
  };

  const getMarkdownUrl = (url: string) => {
    return `![](${url})`;
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setError('只能上传图片文件');
          continue;
        }
        
        console.log('开始上传文件:', file.name);
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(CONFIG.UPLOAD_API_PATH, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (errorData && errorData.environment) {
            throw new Error(`上传失败: 环境变量信息 - ${JSON.stringify(errorData.environment)}`);
          } else {
            const errorText = await response.text();
            throw new Error(`上传失败: ${errorText}`);
          }
        }

        const data = await response.json();
        setUploadedImages(prev => [...prev, { url: data.url, timestamp: Date.now() }]);
      }
    } catch (error) {
      console.error('上传错误:', error);
      setError(error instanceof Error ? error.message : '上传失败，请重试');
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

      {error && (
        <div className="mt-4 text-center text-red-500">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="mt-4 text-center text-blue-500">
          正在上传...
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-6 space-y-4">
          {uploadedImages.map((image, index) => (
            <div key={image.timestamp} className="bg-gray-50 p-4 rounded-lg">
              <div className="relative aspect-square w-full max-w-md mx-auto mb-4">
                <img
                  src={image.url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                {/* 普通 URL */}
                <div className="flex items-center gap-2 bg-white p-2 rounded border">
                  <input
                    type="text"
                    readOnly
                    value={image.url}
                    className="flex-1 text-sm text-gray-600 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => handleCopy(image.url)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    复制
                  </button>
                </div>
                
                {/* Markdown 格式 URL */}
                <div className="flex items-center gap-2 bg-white p-2 rounded border">
                  <input
                    type="text"
                    readOnly
                    value={getMarkdownUrl(image.url)}
                    className="flex-1 text-sm text-gray-600 bg-transparent outline-none"
                  />
                  <button
                    onClick={() => handleCopy(getMarkdownUrl(image.url))}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    复制 MD
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 