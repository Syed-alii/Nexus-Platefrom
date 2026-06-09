import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, PieChart, Filter, Search, PlusCircle, Calendar, Loader } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import api from '../../services/api';

const industries = [
  'SaaS', 'FinTech', 'HealthTech', 'CleanEnergy', 'AI/ML', 
  'E-commerce', 'EdTech', 'RealEstate', 'AgriTech'
];

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  const [recommendedStartups, setRecommendedStartups] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [meetingsRes, startupsRes] = await Promise.all([
            api.get('/meetings'),
            api.get('/profile/entrepreneurs')
          ]);

          const activeMeetings = meetingsRes.data.filter((m: any) => m.status === 'accepted' && new Date(m.startTime) > new Date());
          setUpcomingMeetings(activeMeetings.length);
          setRecommendedStartups(startupsRes.data.slice(0, 6));
        } catch (err) {
          console.error('Failed to fetch dashboard data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const filteredStartups = recommendedStartups.filter(startup => {
    const matchesSearch = searchQuery === '' || 
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.startupName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = selectedIndustries.length === 0 ||
      (startup.industry && selectedIndustries.includes(startup.industry));
    
    return matchesSearch && matchesIndustry;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Investor Dashboard</h1>
          <p className="text-gray-600">Managing your portfolio and discovering new opportunities</p>
        </div>
        
        <Link to="/entrepreneurs">
          <Button
            leftIcon={<Search size={18} />}
          >
            Explore Startups
          </Button>
        </Link>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Total Startups</p>
                <h3 className="text-xl font-semibold text-primary-900">{recommendedStartups.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <PieChart size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Industries</p>
                <h3 className="text-xl font-semibold text-secondary-900">{industries.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">New Startups</p>
                <h3 className="text-xl font-semibold text-accent-900">0</h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Calendar size={20} className="text-success-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-success-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-success-900">{upcomingMeetings}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search by startup or founder name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startAdornment={<Search size={18} />}
                fullWidth
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Industry</label>
              <div className="flex flex-wrap gap-2">
                {industries.map(industry => (
                  <Badge
                    key={industry}
                    variant={selectedIndustries.includes(industry) ? 'primary' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Recommended Startups */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Promising Startups</h2>
          <Link to="/entrepreneurs" className="text-sm text-primary-600 hover:text-primary-500 font-medium">View all</Link>
        </div>
        
        {filteredStartups.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-500">No startups match your filters. Try clearing them to see more.</p>
              <Button 
                variant="ghost" 
                className="mt-2"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndustries([]);
                }}
              >
                Clear filters
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStartups.map(entrepreneur => (
              <EntrepreneurCard
                key={entrepreneur.id}
                entrepreneur={entrepreneur}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
