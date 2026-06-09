import React, { useState, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import SignatureCanvas from 'react-signature-canvas';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface SignDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentId: string;
}

export const SignDocumentModal: React.FC<SignDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentId
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
      setError('Please provide a signature');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get signature image as data URL
      const canvas = sigCanvas.current?.getCanvas();
      if (!canvas) throw new Error('Signature canvas not found');

      const dataURL = canvas.toDataURL('image/png');

      // Convert Data URL to Blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'signature.png');

      console.log('FormData being sent:', formData);

      for (let pair of formData.entries()) {
          console.log(pair[0]+ ': ' + pair[1]);
      }

      await api.patch(`/documents/${documentId}/sign`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Document signed successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Frontend Sign Error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to sign document';
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
          <h2 className="text-xl font-semibold text-gray-900">Sign Document</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-start space-x-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="border border-gray-300 rounded-md">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor='black'
              canvasProps={{width: 400, height: 200, className: 'sigCanvas'}} 
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={() => sigCanvas.current?.clear()}>
            Clear
          </Button>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              Sign Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
