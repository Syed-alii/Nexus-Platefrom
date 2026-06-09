import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, FileText, DollarSign, Calendar, Trash2, Loader, Eye } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting_request': return <Calendar className="text-blue-500" />;
      case 'meeting_accepted': return <CheckCircle className="text-green-500" />;
      case 'document_shared': return <FileText className="text-purple-500" />;
      case 'document_signed': return <FileText className="text-green-500" />;
      case 'payment_received': return <DollarSign className="text-green-600" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  const handleAction = (n: any) => {
    handleMarkAsRead(n._id);
    switch (n.type) {
      case 'meeting_request':
      case 'meeting_accepted':
        navigate('/meetings');
        break;
      case 'document_shared':
      case 'document_signed':
        navigate('/documents');
        break;
      case 'payment_received':
        navigate('/payments');
        break;
    }
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Syncing notifications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated on your collaboration activity</p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardBody className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Bell size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Clear for now</h3>
              <p className="text-gray-500 max-w-xs mx-auto">No new updates. We'll let you know when something important happens.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(n => (
                <div
                  key={n._id}
                  className={`flex items-start p-6 transition-colors duration-200 ${n.isRead ? 'bg-white' : 'bg-primary-50 bg-opacity-30'}`}
                >
                  <div className={`p-3 rounded-lg mr-4 ${n.isRead ? 'bg-gray-100' : 'bg-white shadow-sm border border-primary-100'}`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold truncate ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${n.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleAction(n)} leftIcon={<Eye size={14} />}>
                        View Details
                      </Button>
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(n._id)}>
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
