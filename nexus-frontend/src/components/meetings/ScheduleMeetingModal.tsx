import React, { useState } from 'react';
import { X, Calendar, Clock, AlignLeft, Type, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantEmail: string;
  participantName: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  participantEmail,
  participantName
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error('Invalid date or time');
      }

      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time');
      }

      await api.post('/meetings', {
        participantEmail: participantEmail,
        title,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });

      toast.success('Meeting scheduled successfully!');
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to schedule meeting';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Meeting</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Request a meeting with <span className="font-medium text-gray-900">{participantName}</span>
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-start space-x-2">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
            <Input
              fullWidth
              placeholder="e.g. Project Discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              startAdornment={<Type size={18} className="text-gray-400" />}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[80px]"
              placeholder="What would you like to discuss?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <Input
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              startAdornment={<Calendar size={18} className="text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <Input
                type="time"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                startAdornment={<Clock size={18} className="text-gray-400" />}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <Input
                type="time"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                startAdornment={<Clock size={18} className="text-gray-400" />}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
