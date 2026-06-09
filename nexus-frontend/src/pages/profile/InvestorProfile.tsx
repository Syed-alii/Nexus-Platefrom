import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Building2, MapPin, UserCircle, BarChart3, Briefcase, Video, Loader } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { Investor } from '../../types';
import { ScheduleMeetingModal } from '../../components/meetings/ScheduleMeetingModal';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const endpoint = id ? `/profile/${id}` : '/profile/me';
        const response = await api.get(endpoint);
        setInvestor(response.data);
      } catch (error) {
        toast.error('Failed to load investor profile');
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
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }
  
  if (!investor || investor.role !== 'investor') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Investor not found</h2>
        <p className="text-gray-600 mt-2">The investor profile you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard/entrepreneur">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  const isCurrentUser = currentUser?.id === investor.id;
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile header */}
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={investor.avatarUrl}
              alt={investor.name}
              size="xl"
              status={investor.isOnline ? 'online' : 'offline'}
              className="mx-auto sm:mx-0"
            />
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Investor • {investor.totalInvestments} investments
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge variant="primary">
                  <MapPin size={14} className="mr-1" />
                  {investor.location || 'Location not specified'}
                </Badge>
                {investor.investmentStage?.map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${investor.id}`}>
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
        participantEmail={investor.email}
        participantName={investor.name}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bio & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-600 whitespace-pre-wrap">
                {investor.bio || 'This investor has not provided a bio yet.'}
              </p>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Interests</h2>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {investor.investmentInterests?.length > 0 ? (
                  investor.investmentInterests.map((interest, index) => (
                    <Badge key={index} variant="primary">{interest}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No interests specified.</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Stats & Portfolio */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Profile</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Range</span>
                <span className="text-sm font-medium text-gray-900">
                  {investor.minimumInvestment} - {investor.maximumInvestment}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Investments</span>
                <span className="text-sm font-medium text-gray-900">{investor.totalInvestments}</span>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Portfolio Highlights</h2>
            </CardHeader>
            <CardBody>
              {investor.portfolioCompanies?.length > 0 ? (
                <div className="space-y-3">
                  {investor.portfolioCompanies.map((company, index) => (
                    <div key={index} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                        <Briefcase size={20} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{company}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">No portfolio companies listed.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
