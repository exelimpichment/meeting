// MessageList.tsx
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { getConversation } from '@/fetchers';
import { Message } from '@/client';
import React from 'react';

export const MessageList = () => {
  const { data: messages } = useSuspenseQuery({
    queryKey: ['conversation'],
    queryFn: () => getConversation(),
  });

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-4/5 flex-col">
        {messages.map((msg) => (
          <Message
            content={msg.content}
            sender={msg.sender}
            avatar={msg.avatar}
            timestamp={msg.timestamp}
            key={msg.id}
            status={msg.status}
          />
        ))}
      </div>
    </div>
  );
};
