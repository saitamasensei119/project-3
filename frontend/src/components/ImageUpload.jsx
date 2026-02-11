import { useState, useRef } from 'react';
import ocrService from '../services/ocr.service';
import '../styles/ImageUpload.css';

export default function ImageUpload({ onOCRResult, disabled = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = ocrService.validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Clear previous errors
    setError('');
    
    // Set selected file and preview
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const result = await ocrService.processInvoice(selectedFile);
      
      if (result.success) {
        onOCRResult(result.data);
        // Reset after successful upload
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Không thể xử lý ảnh. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="file-input"
        />
        
        {!preview ? (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Chụp hoặc tải lên ảnh hóa đơn</p>
            <p className="upload-hint">Hỗ trợ: JPEG, PNG, BMP, TIFF (tối đa 10MB)</p>
          </div>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="Invoice preview" className="preview-image" />
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="remove-btn"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedFile && (
        <div className="upload-actions">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || disabled}
            className="btn-primary upload-btn"
          >
            {uploading ? 'Đang xử lý...' : '🔍 Đọc hóa đơn'}
          </button>
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Đang trích xuất thông tin từ ảnh...</p>
        </div>
      )}
    </div>
  );
}
