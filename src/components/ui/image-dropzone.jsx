import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

export function ImageDropzone({
  value,
  onChange,
  onClear,
  aspectRatio = '16/7',
  maxSizeMB = 10,
  recommendedText = 'Recommended 16:7 (e.g. 1024x450). PNG, JPG, WEBP up to 10MB',
  className = '',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Image is too large. Maximum allowed size is ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        file,
        previewUrl: reader.result,
        name: file.name,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleContainerClick}
        className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-4 ring-blue-500/20 scale-[1.01]'
            : value
            ? 'border-blue-300 dark:border-blue-800/80 bg-blue-50/20 dark:bg-blue-950/20 hover:border-blue-400'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
        }`}
      >
        {value ? (
          <div className="space-y-3">
            <div
              className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 mx-auto max-w-md shadow-sm ${
                aspectRatio === '16/7'
                  ? 'aspect-[16/7]'
                  : aspectRatio === '16/9'
                  ? 'aspect-video'
                  : 'aspect-[4/3]'
              }`}
            >
              <img
                src={value}
                alt="Uploaded graphic"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />

              {/* Top controls over preview */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                {onClear && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      onClear();
                    }}
                    className="p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors backdrop-blur-sm"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {isDragging && (
                <div className="absolute inset-0 bg-blue-600/80 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm">
                  <Upload className="h-6 w-6 mr-2 animate-bounce" />
                  Drop new file to replace
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Image Loaded
              </Badge>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Click or drag & drop another file to replace
              </span>
            </div>
          </div>
        ) : (
          <div className="py-7 px-4 space-y-3">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-200 ${
                isDragging
                  ? 'bg-blue-600 text-white scale-110 shadow-lg'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              }`}
            >
              <Upload className={`h-6 w-6 ${isDragging ? 'animate-bounce' : ''}`} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isDragging ? (
                  <span className="text-blue-600 dark:text-blue-400">
                    Drop your image file here!
                  </span>
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400 hover:underline">
                      Click to choose from machine
                    </span>{' '}
                    or drag & drop here
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {recommendedText}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <Badge variant="outline" className="text-[10px] text-slate-500">
                Drag & Drop Ready
              </Badge>
              <Badge variant="outline" className="text-[10px] text-slate-500">
                PNG / JPG / WEBP
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageDropzone;
