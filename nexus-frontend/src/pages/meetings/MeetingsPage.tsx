import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, AlertCircle, Loader, Video, List, LayoutGrid } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import api from '../../services/api';
import { Meeting } from '../../types';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'upcoming'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/meetings');
      setMeetings(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch meetings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleStatusUpdate = async (meetingId: string, action: 'accept' | 'reject') => {
    try {
      await api.patch(`/meetings/${meetingId}/${action}`);
      toast.success(`Meeting ${action === 'accept' ? 'accepted' : 'rejected'}`);
      fetchMeetings(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} meeting`);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (activeTab === 'pending') return meeting.status === 'pending' && (meeting.participant as any)._id === user?.id;
    if (activeTab === 'upcoming') return meeting.status === 'accepted' && new Date(meeting.startTime) > new Date();
    return true;
  });

  const calendarEvents = meetings.map(m => ({
    id: m.id || (m as any)._id,
    title: m.title,
    start: m.startTime,
    end: m.endTime,
    backgroundColor: m.status === 'accepted' ? '#10b981' : (m.status === 'pending' ? '#3b82f6' : '#9ca3af'),
    borderColor: 'transparent',
    extendedProps: m
  }));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-gray-600">Loading your meetings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Manage your scheduled calls and invitations</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid size={16} /> Calendar
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All Meetings
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'pending' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Invitations
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'upcoming' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
      </div>

      {viewMode === 'list' ? (
        filteredMeetings.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <CalendarIcon size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-600">No meetings found for this category.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMeetings.map((meeting) => {
              const isOrganizer = (meeting.organizer as any)._id === user?.id;
              const otherParty = isOrganizer ? (meeting.participant as any) : (meeting.organizer as any);
              
              return (
                <Card key={meeting.id || (meeting as any)._id}>
                  <CardBody className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                              <Badge 
                                variant={
                                  meeting.status === 'accepted' ? 'success' : 
                                  meeting.status === 'pending' ? 'primary' : 
                                  meeting.status === 'rejected' ? 'danger' : 'gray'
                                }
                              >
                                {meeting.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{meeting.description || 'No description provided.'}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon size={16} className="mr-2" />
                                {formatDate(meeting.startTime)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock size={16} className="mr-2" />
                                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <User size={16} className="mr-2" />
                                {isOrganizer ? 'Invited' : 'Organized by'}: {otherParty.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 flex flex-col justify-center items-center md:border-l border-gray-200 min-w-[200px]">
                        <Avatar src={otherParty.avatarUrl} alt={otherParty.name} size="lg" className="mb-2" />
                        <span className="text-sm font-medium text-gray-900 text-center">{otherParty.name}</span>
                        <span className="text-xs text-gray-500 capitalize">{otherParty.role}</span>
                        
                        {!isOrganizer && meeting.status === 'pending' && (
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              variant="success" 
                              size="sm" 
                              leftIcon={<CheckCircle size={14} />}
                              onClick={() => handleStatusUpdate((meeting as any)._id, 'accept')}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              leftIcon={<XCircle size={14} />}
                              onClick={() => handleStatusUpdate((meeting as any)._id, 'reject')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        {meeting.status === 'accepted' && (
                          <Button 
                            className="mt-4 w-full"
                            variant="primary"
                            size="sm"
                            leftIcon={<Video size={14} />}
                            onClick={() => navigate(`/meetings/video/${(meeting as any)._id}`)}
                          >
                            Join Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <Card className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={(info) => {
              const m = info.event.extendedProps;
              if (m.status === 'accepted') {
                navigate(`/meetings/video/${m._id || m.id}`);
              } else {
                toast.info(`Status: ${m.status}`);
              }
            }}
            height="auto"
          />
        </Card>
      )}
    </div>
  );
};
