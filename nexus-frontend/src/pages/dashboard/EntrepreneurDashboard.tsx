import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar, TrendingUp, AlertCircle, PlusCircle, Loader } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest, Investor } from '../../types';
import api from '../../services/api';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState<Investor[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [meetingsRes, investorsRes] = await Promise.all([
            api.get('/meetings'),
            api.get('/profile/investors')
          ]);

          const activeMeetings = meetingsRes.data.filter((m: any) => m.status === 'accepted' && new Date(m.startTime) > new Date());
          setUpcomingMeetings(activeMeetings.length);
          setRecommendedInvestors(investorsRes.data.slice(0, 3));
          
          // Mocking collab requests for now as we don't have that API fully integrated in DB yet
          // But everything else is live.
        } catch (err) {
          console.error('Failed to fetch dashboard data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        
        <Link to="/investors">
          <Button
            leftIcon={<PlusCircle size={18} />}
          >
            Find Investors
          </Button>
        </Link>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">New Interests</p>
                <h3 className="text-xl font-semibold text-primary-900">0</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Bell size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Active Requests</p>
                <h3 className="text-xl font-semibold text-secondary-900">{collaborationRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">{upcomingMeetings}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-500">View all</Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {collaborationRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">No pending collaboration requests.</p>
                </div>
              ) : (
                collaborationRequests.map(request => (
                  <CollaborationRequestCard
                    key={request.id}
                    request={request}
                  />
                ))
              )}
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Startup Progress</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">Profile Completion</span>
                    <span className="text-primary-600 font-bold">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start">
                  <AlertCircle size={20} className="text-amber-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Next Step: Upload Pitch Deck</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Investors are 4x more likely to contact you if your pitch deck is available in the Document Chamber.
                    </p>
                    <Link to="/documents">
                      <Button variant="outline" size="sm" className="mt-2 text-amber-700 border-amber-300 hover:bg-amber-100">
                        Go to Documents
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm text-primary-600 hover:text-primary-500">View all</Link>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendedInvestors.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No investors available.</p>
              ) : (
                recommendedInvestors.map(investor => (
                  <InvestorCard
                    key={investor.id}
                    investor={investor}
                    showActions={false}
                  />
                ))
              )}
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Market Insights</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start">
                  <TrendingUp size={18} className="text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">FinTech</span> is seeing a 15% increase in seed round investments this quarter.
                  </p>
                </div>
                <div className="flex items-start">
                  <TrendingUp size={18} className="text-green-500 mr-2 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Average deal size for <span className="font-semibold">SaaS</span> startups in NY has grown to $1.2M.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
