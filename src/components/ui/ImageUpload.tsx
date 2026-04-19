import React, { useCallback, useState, useRef } from 'react';
import { cn } from '../../utils';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  previewUrl?: string;
  onRemove?: () => void;
  uploading?: boolean;
  progress?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  previewUrl,
  onRemove,
  uploading = false,
  progress = 0,
  className,
}) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    },
    [onImageSelected],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelected(file);
      }
    },
    [onImageSelected],
  );

  if (previewUrl) {
    return (
      <div className={cn('relative rounded-2xl overflow-hidden group', className)}>
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-56 object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">{Math.round(progress)}%</span>
          </div>
        )}
        {!uploading && onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
        isDragging
          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]'
          : 'border-[var(--border-default)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary-soft)]',
        className,
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary-soft)] flex items-center justify-center">
          <Upload className="w-6 h-6 text-[var(--accent-primary)]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{t('dragDrop')}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('maxFileSize')}</p>
        </div>
      </div>
    </div>
  );
};
