import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Loader, MessageSquarePlus } from 'lucide-react';

interface ChatUserListProps {
  activeUserId?: string;
}

export const ChatUserList: React.FC<ChatUserListProps> = ({ activeUserId }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser) {
      const fetchConversations = async () => {
        setIsLoading(true);
        try {
          // Fetch conversations from the real backend API
          const res = await api.get('/messages');
          setConversations(res.data);
        } catch (error) {
          console.error('Error fetching conversations', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchConversations();
    }
  }, [currentUser]);

  if (!currentUser) return null;
  
  const handleSelectUser = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="bg-white w-full overflow-y-auto h-full flex flex-col">
      <div className="p-4 bg-[#f0f2f5] border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">Chats</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-primary-600" size={24} />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.length > 0 ? (
              conversations.map(conversation => {
                const otherUser = conversation._id; // Populated user object
                const lastMessage = conversation.lastMessage;
                const isActive = activeUserId === otherUser._id;
                
                return (
                  <div
                    key={conversation._id._id}
                    className={`px-4 py-3 flex cursor-pointer transition-colors duration-200 ${
                      isActive
                        ? 'bg-[#ebebeb]'
                        : 'hover:bg-[#f5f6f6]'
                    }`}
                    onClick={() => handleSelectUser(otherUser._id)}
                  >
                    <Avatar
                      src={otherUser.avatarUrl}
                      alt={otherUser.name}
                      size="md"
                      className="mr-3 flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {otherUser.name}
                        </h3>
                        
                        {lastMessage && (
                          <span className="text-[11px] text-gray-500">
                            {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-0.5">
                        {lastMessage && (
                          <p className="text-[13px] text-gray-500 truncate">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                   <MessageSquarePlus className="text-gray-300" size={24} />
                </div>
                <p className="text-xs text-gray-500">Search for investors or entrepreneurs to start a chat.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
