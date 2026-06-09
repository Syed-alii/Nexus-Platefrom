import React from 'react';
import { format } from 'date-fns';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  console.log('[DEBUG] ChatMessage:', { content: message.content, isOwn, senderId: message.senderId });
  const dateValue = message.timestamp || (message as any).createdAt;
  const date = new Date(dateValue);
  const isValidDate = !isNaN(date.getTime());

  return (
    <div
      className={`flex w-full mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`relative px-4 py-2 rounded-2xl shadow-sm break-words overflow-wrap-break-word ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-none ml-auto'
            : 'bg-gray-200 text-gray-900 rounded-bl-none mr-auto'
        }`}
        style={{ maxWidth: '70%' }}
      >
        <p className="text-[15px] leading-relaxed mb-1">{message.content}</p>
        
        <div className={`text-[10px] flex items-center justify-end space-x-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          <span>
            {isValidDate ? format(date, 'HH:mm') : 'N/A'}
          </span>
          {isOwn && (
            <svg viewBox="0 0 16 15" width="14" height="13" className={message.isRead ? 'text-blue-200' : 'text-gray-300'}>
              <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879 5.817 7.484a.366.365 0 0 0-.51.015l-.471.487a.365.365 0 0 0 .015.51l3.58 3.004a.365.365 0 0 0 .506-.013L15.073 3.827a.366.365 0 0 0-.063-.511zm-4.326 0l-.478-.372a.365.365 0 0 0-.51.063L5.19 9.879 2.342 7.484a.366.365 0 0 0-.51.015l-.471.487a.365.365 0 0 0 .015.51l3.58 3.004a.365.365 0 0 0 .506-.013l4.321-7.14a.366.365 0 0 0-.064-.51z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};
