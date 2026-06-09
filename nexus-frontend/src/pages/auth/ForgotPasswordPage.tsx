import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSent(true);
      toast.success('Reset instructions generated!');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualReset = () => {
    if (token) {
      navigate(`/reset-password/${token}`);
    } else {
      toast.error('Please enter the reset token');
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Instructions Sent</h2>
            <p className="text-gray-600 mb-6">
              A reset token has been generated for <span className="font-semibold">{email}</span>.
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
              <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center">
                <Key size={16} className="mr-2" /> Dev Environment Note:
              </h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Check the <strong>Backend Terminal Logs</strong> for the mock email. 
                Copy the hex token (e.g. <code>5f2a...</code>) and paste it below:
              </p>
              
              <div className="mt-4 space-y-3">
                <Input
                  placeholder="Paste Reset Token Here"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  fullWidth
                />
                <Button 
                  fullWidth 
                  onClick={handleManualReset}
                  variant="primary"
                >
                  Proceed to Reset Password
                </Button>
              </div>
            </div>

            <Link to="/login">
              <Button fullWidth variant="ghost" size="sm">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startAdornment={<Mail size={18} />}
              fullWidth
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>

            <Link to="/login" className="block text-center mt-4">
              <span className="text-sm text-primary-600 hover:text-primary-500 flex items-center justify-center">
                <ArrowLeft size={16} className="mr-1" /> Back to login
              </span>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};
