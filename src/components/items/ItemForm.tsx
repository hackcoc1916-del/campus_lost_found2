import React, { useState } from 'react';
import { MapPin, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageUpload } from '../ui/ImageUpload';
import { useAuth } from '../../AuthContext';
import { useLanguage } from '../../LanguageContext';
import { CATEGORIES, CATEGORY_ICONS, cn } from '../../utils';
import { createItem } from '../../services/items';
import { uploadImage } from '../../services/storage';
import toast from 'react-hot-toast';

interface ItemFormProps {
  onClose: () => void;
  initialType?: 'lost' | 'found';
}

export const ItemForm: React.FC<ItemFormProps> = ({ onClose, initialType }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: initialType || 'lost',
    category: CATEGORIES[0],
    location: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleImageSelected = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately
    setUploading(true);
    try {
      const url = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });
      setUploadedImageUrl(url);
      toast.success('Image uploaded!');
    } catch {
      toast.error('Image upload failed');
      setImageFile(null);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setUploadedImageUrl('');
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await createItem({
        ...formData,
        type: formData.type as 'lost' | 'found',
        imageUrl: uploadedImageUrl || undefined,
        reportedBy: user._id,
        reportedByName: user.name || 'Anonymous',
        reportedByPhoto: user.photoURL || undefined,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      toast.success(t('reportSuccess'));
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(t('reportError'));
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.title.trim() && formData.type;
    if (step === 2) return formData.description.trim() && formData.location.trim() && formData.date;
    return true;
  };

  const totalSteps = 3;

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Progress bar */}
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {t('step')} {step} {t('of')} {totalSteps}
          </span>
          <span className="text-xs font-semibold text-[var(--accent-primary)]">
            {step === 1 ? t('basicInfo') : step === 2 ? t('detailsLocation') : t('uploadReview')}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in-up">
            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('type')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['lost', 'found'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={cn(
                      'py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 cursor-pointer',
                      formData.type === type
                        ? type === 'lost'
                          ? 'border-[var(--status-lost)] bg-[var(--status-lost-soft)] text-[var(--status-lost)]'
                          : 'border-[var(--status-found)] bg-[var(--status-found-soft)] text-[var(--status-found)]'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]',
                    )}
                  >
                    {type === 'lost' ? '🔍' : '✅'} {t(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('title')}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Blue iPhone 15, Black Wallet, Golden Retriever..."
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent text-sm font-medium outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('category')}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={cn(
                      'py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer text-center',
                      formData.category === cat
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]',
                    )}
                  >
                    <span className="block text-base mb-0.5">{CATEGORY_ICONS[cat]}</span>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details & Location */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('description')}
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item in detail — color, brand, size, distinguishing marks..."
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-none text-sm font-medium outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('location')}
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Library 2nd Floor, Cafeteria, Parking Lot B..."
                  className="w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent text-sm font-medium outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('date')}
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent text-sm font-medium outline-none text-[var(--text-primary)]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Image Upload & Review */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in-up">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {t('imageUpload')} <span className="text-[10px] font-normal">{t('optional')}</span>
              </label>
              <ImageUpload
                onImageSelected={handleImageSelected}
                previewUrl={imagePreview}
                onRemove={handleRemoveImage}
                uploading={uploading}
                progress={uploadProgress}
              />
            </div>

            {/* Review summary */}
            <div className="bg-[var(--bg-input)] rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Review</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[var(--text-muted)]">{t('type')}</span>
                  <p className="font-semibold text-[var(--text-primary)] capitalize">{formData.type}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">{t('category')}</span>
                  <p className="font-semibold text-[var(--text-primary)]">{formData.category}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--text-muted)]">{t('title')}</span>
                  <p className="font-semibold text-[var(--text-primary)]">{formData.title}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">{t('location')}</span>
                  <p className="font-semibold text-[var(--text-primary)]">{formData.location}</p>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">{t('date')}</span>
                  <p className="font-semibold text-[var(--text-primary)]">{formData.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="flex-1"
            >
              {t('previous')}
            </Button>
          )}
          {step < totalSteps ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              icon={<ArrowRight className="w-4 h-4" />}
              className="flex-1"
            >
              {t('next')}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!canProceed() || uploading}
              icon={<Check className="w-4 h-4" />}
              className="flex-1"
            >
              {t('submit')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
