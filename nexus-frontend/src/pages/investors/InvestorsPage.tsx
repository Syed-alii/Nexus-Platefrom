import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Loader } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import api from '../../services/api';
import { Investor } from '../../types';
import toast from 'react-hot-toast';

export const InvestorsPage: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await api.get('/profile/investors');
        setInvestors(response.data);
      } catch (error) {
        toast.error('Failed to load investors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestors();
  }, []);

  // Get unique investment stages and interests
  const allStages = Array.from(new Set(investors.flatMap(i => i.investmentStage || [])));
  const allInterests = Array.from(new Set(investors.flatMap(i => i.investmentInterests || [])));
  
  // Filter investors based on search and filters
  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = searchQuery === '' || 
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (investor.investmentInterests && investor.investmentInterests.some(interest => 
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    
    const matchesStages = selectedStages.length === 0 ||
      (investor.investmentStage && investor.investmentStage.some(stage => selectedStages.includes(stage)));
    
    const matchesInterests = selectedInterests.length === 0 ||
      (investor.investmentInterests && investor.investmentInterests.some(interest => selectedInterests.includes(interest)));
    
    return matchesSearch && matchesStages && matchesInterests;
  });
  
  const toggleStage = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Discovering investors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">Connect with investors who match your startup's needs</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Stage</h3>
                {allStages.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No stages available</p>
                ) : (
                  <div className="space-y-2">
                    {allStages.map(stage => (
                      <button
                        key={stage}
                        onClick={() => toggleStage(stage)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                          selectedStages.includes(stage)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Investment Interests</h3>
                {allInterests.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No interests available</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map(interest => (
                      <Badge
                        key={interest}
                        variant={selectedInterests.includes(interest) ? 'primary' : 'gray'}
                        className="cursor-pointer"
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search investors by name, interests, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredInvestors.length} results
              </span>
            </div>
          </div>
          
          {filteredInvestors.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-gray-500">No investors found matching your criteria.</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInvestors.map(investor => (
                <InvestorCard
                  key={investor.id}
                  investor={investor}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
