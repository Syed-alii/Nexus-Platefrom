import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentGroupId?: string; // Optional for versioning
  initialTitle?: string;     // Optional for versioning
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentGroupId,
  initialTitle
}) => {
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      if (!title && !initialTitle) {
        // Set default title to file name without extension
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [title, initialTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    multiple: false
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    if (documentGroupId) {
      formData.append('documentGroupId', documentGroupId);
    }

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(documentGroupId ? 'New version uploaded!' : 'Document uploaded successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to upload document';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {documentGroupId ? 'Upload New Version' : 'Upload Document'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-start space-x-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Document Title</label>
            <Input
              fullWidth
              placeholder="e.g. Q2 Financial Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={!!documentGroupId} // Lock title for new versions
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[80px]"
              placeholder="Brief description of the document contents"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">File</label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
              } ${file ? 'bg-green-50 border-green-200' : ''}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <CheckCircle size={32} className="text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!file || !title}>
              {documentGroupId ? 'Update Version' : 'Upload'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
