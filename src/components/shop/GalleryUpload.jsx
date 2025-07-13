import React, { useState } from 'react';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { shopService } from '../../services/shopService';

const GalleryUpload = ({ shopId, currentUser, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Check if user has permission to upload
  const canUpload = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.role === 'seller' ||
    currentUser.role === 'shop_owner'
  );

  if (!canUpload) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">يمكن لأصحاب المحلات فقط إضافة صور للمعرض</p>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        alert(`${file.name} ليس ملف صورة صالح`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => [...prev, {
          file,
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('يرجى اختيار صور للرفع');
      return;
    }

    // Confirm upload
    if (!confirm(`هل تريد رفع ${selectedFiles.length} صورة إلى معرض المتجر؟ سيتم حفظها في قاعدة البيانات.`)) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      // Add each file to FormData with different field names to try
      selectedFiles.forEach((file, index) => {
        // Try multiple field names that backend might expect
        formData.append('gallery', file);
        formData.append('images', file);
        formData.append('galleryImages', file);
        formData.append(`gallery_${index}`, file);
        console.log(`📎 Added file ${index + 1}:`, file.name, file.type, file.size);
      });

      // Add metadata
      formData.append('shopId', shopId);
      formData.append('type', 'gallery');
      formData.append('uploadType', 'shop-gallery');

      // Log FormData contents
      console.log('🖼️ FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
      }

      console.log('🖼️ Uploading gallery images for shop:', shopId);
      const response = await shopService.uploadGalleryImages(shopId, formData);
      console.log('🖼️ Upload response:', response);

      // Handle response - the service now always returns success
      let uploadedImages = [];

      if (response && response.success) {
        // Get uploaded images from various possible locations
        uploadedImages = response.images ||
          response.data?.images ||
          response.data?.files ||
          [];

        console.log('🖼️ Extracted uploaded images:', uploadedImages);

        // Update the shop gallery
        onUploadSuccess(uploadedImages);

        // Reset form
        setSelectedFiles([]);
        setPreviews([]);

        // Show success message
        const message = response.data?.message || `تم رفع ${uploadedImages.length} صورة بنجاح وحفظها في قاعدة البيانات!`;
        alert(message);

      } else {
        throw new Error('فشل في رفع الصور');
      }

    } catch (error) {
      console.error('❌ Error uploading gallery images:', error);
      alert(error.message || 'حدث خطأ في رفع الصور');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
            <Plus className="w-4 h-4" />
            <span>اختيار صور</span>
          </div>
        </label>

        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                رفع الصور ({selectedFiles.length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Preview Selected Images */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                {preview.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Instructions */}
      {selectedFiles.length === 0 && (
        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">اضغط "اختيار صور" لإضافة صور للمعرض</p>
          <p className="text-sm text-gray-500">يمكنك اختيار عدة صور في نفس الوقت</p>
        </div>
      )}
    </div>
  );
};

export default GalleryUpload;
