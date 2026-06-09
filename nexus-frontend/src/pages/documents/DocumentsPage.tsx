import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Trash2, Eye, History, Loader, AlertCircle, Edit3 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { UploadDocumentModal } from '../../components/documents/UploadDocumentModal';
import { FilePreviewModal } from '../../components/documents/FilePreviewModal';
import { SignDocumentModal } from '../../components/documents/SignDocumentModal';
import api from '../../services/api';
import { Document } from '../../types';
import toast from 'react-hot-toast';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<Document | null>(null);
  const [selectedDocForVersion, setSelectedDocForVersion] = useState<{groupId: string, title: string} | null>(null);
  const [selectedDocForSigning, setSelectedDocForSigning] = useState<Document | null>(null);


  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/documents');
      // Group by documentGroupId and take the latest version for the main list
      const latestVersionsMap = new Map<string, Document>();
      response.data.forEach((doc: Document) => {
        const existing = latestVersionsMap.get(doc.documentGroupId);
        if (!existing || doc.version > existing.version) {
          latestVersionsMap.set(doc.documentGroupId, doc);
        }
      });
      setDocuments(Array.from(latestVersionsMap.values()));
    } catch (error: any) {
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This will remove this specific version.')) return;
    
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Loading your documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Securely store and manage your business files</p>
        </div>
        
        <Button 
          leftIcon={<Upload size={18} />}
          onClick={() => {
            setSelectedDocForVersion(null);
            setIsUploadModalOpen(true);
          }}
        >
          Upload New
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Summary</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between text-primary-700 mb-1">
                  <span className="text-sm font-medium">Total Documents</span>
                  <span className="text-xl font-bold">{documents.length}</span>
                </div>
                <p className="text-xs text-primary-600">Managed in your chamber</p>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Supported Formats</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gray">PDF</Badge>
                  <Badge variant="gray">DOC/DOCX</Badge>
                  <Badge variant="gray">Images</Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Your Chamber</h2>
              <span className="text-xs text-gray-500">Showing latest versions</span>
            </CardHeader>
            <CardBody className="p-0">
              {documents.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No documents yet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Upload pitch decks, term sheets, or other important files to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {documents.map(doc => (
                    <div
                      key={doc.id || (doc as any)._id}
                      className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <div className="p-3 bg-gray-100 rounded-lg mr-4 group-hover:bg-primary-50 transition-colors">
                        <FileText size={24} className="text-gray-500 group-hover:text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {doc.title}
                          </h3>
                          <Badge variant="secondary" size="sm">v{doc.version}</Badge>
                          <Badge 
                            variant={doc.status === 'signed' ? 'success' : 'gray'} 
                            size="sm"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="uppercase">{doc.fileType}</span>
                          <span>Modified {formatDate(doc.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        {doc.status !== 'signed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                            onClick={() => setSelectedDocForSigning(doc)}
                            title="Sign Document"
                          >
                            <Edit3 size={18} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => setSelectedDocForPreview(doc)}
                          title="Preview"
                        >
                          <Eye size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => {
                            setSelectedDocForVersion({ groupId: doc.documentGroupId, title: doc.title });
                            setIsUploadModalOpen(true);
                          }}
                          title="Upload New Version"
                        >
                          <History size={18} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(doc.id || (doc as any)._id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedDocForVersion(null);
        }}
        onSuccess={fetchDocuments}
        documentGroupId={selectedDocForVersion?.groupId}
        initialTitle={selectedDocForVersion?.title}
      />

      {selectedDocForPreview && (
        <FilePreviewModal
          isOpen={!!selectedDocForPreview}
          onClose={() => setSelectedDocForPreview(null)}
          document={selectedDocForPreview}
        />
      )}

      {selectedDocForSigning && (
        <SignDocumentModal
          isOpen={!!selectedDocForSigning}
          onClose={() => setSelectedDocForSigning(null)}
          onSuccess={fetchDocuments}
          documentId={selectedDocForSigning.id || (selectedDocForSigning as any)._id}
        />
      )}
    </div>
  );
};
