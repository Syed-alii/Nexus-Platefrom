import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, MapPin, Briefcase, Info, Rocket, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export const CreateProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Common State
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  // Entrepreneur State
  const [startupName, setStartupName] = useState('');
  const [industry, setIndustry] = useState('');
  const [pitchSummary, setPitchSummary] = useState('');

  // Investor State
  const [investmentFocus, setInvestmentFocus] = useState('');
  const [investmentRange, setInvestmentRange] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData: any = {
        bio,
        location,
      };

      if (user?.role === 'entrepreneur') {
        profileData.startupName = startupName;
        profileData.industry = industry;
        profileData.pitchSummary = pitchSummary;
      } else {
        profileData.investmentInterests = investmentFocus.split(',').map(s => s.trim());
        profileData.investmentRange = investmentRange;
      }

      await updateProfile(user!.id, profileData);
      toast.success('Profile created successfully!');
      navigate('/dashboard/' + user!.role);
    } catch (error) {
      toast.error('Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <Rocket className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Complete your professional profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Tell the Nexus community about yourself to start collaborating.
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={user?.name || ''}
                  disabled
                  fullWidth
                  startAdornment={<Info size={18} />}
                />
                <Input
                  label="Location"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  fullWidth
                  startAdornment={<MapPin size={18} />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Bio
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
                  placeholder="Share your experience and vision..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
              </div>

              {user?.role === 'entrepreneur' ? (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Startup Name"
                      placeholder="Your company name"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      required
                      fullWidth
                      startAdornment={<Building2 size={18} />}
                    />
                    <Input
                      label="Industry"
                      placeholder="e.g. SaaS, FinTech"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      fullWidth
                      startAdornment={<Briefcase size={18} />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pitch Summary
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px]"
                      placeholder="A short elevator pitch of your startup..."
                      value={pitchSummary}
                      onChange={(e) => setPitchSummary(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Investment Focus"
                      placeholder="e.g. AI, Clean Energy (comma separated)"
                      value={investmentFocus}
                      onChange={(e) => setInvestmentFocus(e.target.value)}
                      required
                      fullWidth
                      startAdornment={<Rocket size={18} />}
                    />
                    <Input
                      label="Investment Range"
                      placeholder="e.g. $50k - $500k"
                      value={investmentRange}
                      onChange={(e) => setInvestmentRange(e.target.value)}
                      required
                      fullWidth
                      startAdornment={<DollarSign size={18} />}
                    />
                  </div>
                </div>
              )}

              <div className="pt-6">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  size="lg"
                >
                  Create Profile
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
