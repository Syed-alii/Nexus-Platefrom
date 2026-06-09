import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, FileText, DollarSign, Send, Video, Loader } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import { ScheduleMeetingModal } from '../../components/meetings/ScheduleMeetingModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const endpoint = id ? `/profile/${id}` : '/profile/me';
        const response = await api.get(endpoint);
        setEntrepreneur(response.data);
      } catch (error) {
        toast.error('Failed to load startup profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Loading startup details...</p>
      </div>
    );
  }
  
  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <p className="text-gray-600 mt-2">The startup profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === entrepreneur.id;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              status={entrepreneur.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName || 'Startup (Pending)'}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">{entrepreneur.industry || 'General'}</Badge>
                <Badge variant="gray">
                  <MapPin size={14} className="mr-1" />
                  {entrepreneur.location || 'Remote'}
                </Badge>
                <Badge variant="accent">
                  <Calendar size={14} className="mr-1" />
                  Founded {entrepreneur.foundedYear}
                </Badge>
                <Badge variant="secondary">
                  <Users size={14} className="mr-1" />
                  {entrepreneur.teamSize} team members
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${entrepreneur.id}`}>
                  <Button
                    variant="outline"
                    leftIcon={<MessageCircle size={18} />}
                  >
                    Message
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  leftIcon={<Video size={18} />}
                  onClick={() => setIsMeetingModalOpen(true)}
                >
                  Schedule Meeting
                </Button>
              </>
            )}
            
            {isCurrentUser && (
              <Button
                variant="outline"
                leftIcon={<UserCircle size={18} />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
      
      <ScheduleMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        participantEmail={entrepreneur.email}
        participantName={entrepreneur.name}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Pitch Deck</h2>
            </CardHeader>
            <CardBody>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{entrepreneur.startupName}</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {entrepreneur.pitchSummary || 'This startup has not provided a pitch summary yet.'}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About the Founder</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 whitespace-pre-wrap">
                {entrepreneur.bio || 'The founder has not provided a bio yet.'}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Funding Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Stage</span>
                <Badge variant="accent">{entrepreneur.fundingStage || 'Undisclosed'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Seeking</span>
                <span className="text-lg font-bold text-primary-600">{entrepreneur.fundingNeeded || 'Undisclosed'}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
