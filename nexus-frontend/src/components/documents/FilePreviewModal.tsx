import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Document } from '../../types';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  if (!isOpen) return null;

  // Helper to handle both local and cloud URLs
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:5005${url}`;
  };

  const fullUrl = getFullUrl(document.fileUrl);
  const signatureUrl = document.signatureUrl ? getFullUrl(document.signatureUrl) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-gray-900 font-semibold truncate">
            <span>{document.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <a href={fullUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" leftIcon={<ExternalLink size={16} />}>
                Open in New Tab
              </Button>
            </a>
            <a href={fullUrl} download={document.title}>
              <Button variant="ghost" size="sm" leftIcon={<Download size={16} />}>
                Download
              </Button>
            </a>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 transition-colors ml-2">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 overflow-auto p-4 flex items-center justify-center relative">
          <div className="relative w-full h-full flex items-center justify-center">
            {document.fileType === 'pdf' ? (
              <iframe
                src={`${fullUrl}#toolbar=0`}
                className="w-full h-full border-none rounded-sm shadow-sm bg-white"
                title={document.title}
              />
            ) : document.fileType === 'image' ? (
              <img
                src={fullUrl}
                alt={document.title}
                className="max-w-full max-h-full object-contain rounded-sm shadow-sm"
              />
            ) : (
              <div className="text-center p-12 bg-white rounded-lg shadow-sm border border-gray-200 max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
                  <ExternalLink size={32} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
                <p className="text-gray-600 mb-6">This file type cannot be previewed directly in the browser.</p>
                <a href={fullUrl} download={document.title}>
                  <Button variant="primary">Download to View</Button>
                </a>
              </div>
            )}

            {/* Signature Overlay */}
            {document.status === 'signed' && signatureUrl && (
              <div className="absolute bottom-10 right-10 z-10 bg-white p-2 rounded shadow-lg border border-gray-200">
                <img src={signatureUrl} alt="Signature" className="max-w-[200px] h-auto" />
                <p className="text-[10px] text-gray-400 mt-1">Signed on {new Date(document.signedAt!).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
