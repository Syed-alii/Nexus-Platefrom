import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Loader } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import api from '../../services/api';
import { Entrepreneur } from '../../types';
import toast from 'react-hot-toast';

export const EntrepreneursPage: React.FC = () => {
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchEntrepreneurs = async () => {
      try {
        const response = await api.get('/profile/entrepreneurs');
        setEntrepreneurs(response.data);
      } catch (error) {
        toast.error('Failed to load startups');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntrepreneurs();
  }, []);

  // Get unique industries
  const allIndustries = Array.from(new Set(entrepreneurs.map(e => e.industry || 'Other')));
  
  // Filter entrepreneurs based on search and filters
  const filteredEntrepreneurs = entrepreneurs.filter(entrepreneur => {
    const matchesSearch = searchQuery === '' || 
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entrepreneur.industry && entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entrepreneur.pitchSummary && entrepreneur.pitchSummary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesIndustry = selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);
    
    return matchesSearch && matchesIndustry;
  });
  
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Discovering startups...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">Discover promising startups looking for investment</p>
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
                <h3 className="text-sm font-medium text-gray-900 mb-2">Industry</h3>
                {allIndustries.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No industries available</p>
                ) : (
                  <div className="space-y-2">
                    {allIndustries.map(industry => (
                      <button
                        key={industry}
                        onClick={() => toggleIndustry(industry)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                          selectedIndustries.includes(industry)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {industry}
                      </button>
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
              placeholder="Search startups by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredEntrepreneurs.length} results
              </span>
            </div>
          </div>
          
          {filteredEntrepreneurs.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-gray-500">No startups found matching your criteria.</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntrepreneurs.map(entrepreneur => (
                <EntrepreneurCard
                  key={entrepreneur.id}
                  entrepreneur={entrepreneur}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
