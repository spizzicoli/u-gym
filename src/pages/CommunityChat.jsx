import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatInputBar from '../components/ChatInputBar';
import { sendChatMessage, subscribeToMessages, uploadChatFile } from '../lib/chat';
import './CommunityPage.scss';

export default function CommunityChat() {
  const { user } = useApp();
  const [messages, setMessages] = useState([]);

  useEffect(() => subscribeToMessages('community_messages', null, setMessages), []);

  const sendText = async (text, reset) => {
    if (!text.trim()) return;
    await sendChatMessage('community_messages', { type: 'text', message: text, user_id: user.id, username: user.username });
    reset('');
  };

  const sendImage = async (file) => {
    const imageUrl = await uploadChatFile(file, user.id, 'community');
    await sendChatMessage('community_messages', { type: 'image', image_url: imageUrl, user_id: user.id, username: user.username });
  };

  const sendAudio = async () => console.log('Registrazione audio non ancora disponibile');

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((message) => {
          const isMine = message.user_id === user.id;
          return (
            <div key={message.id} className={`message ${isMine ? 'mine' : 'other'}`}>
              <div className="author">{isMine ? 'Tu' : message.username}</div>
              {message.type === 'text' && <div className="bubble">{message.message}</div>}
              {message.type === 'image' && <img src={message.image_url} className="bubble image-msg" alt="Allegato" />}
              {message.type === 'audio' && <audio controls className="bubble audio-msg"><source src={message.audio_url} /></audio>}
            </div>
          );
        })}
      </div>
      <ChatInputBar onSendText={sendText} onSendImage={sendImage} onSendAudio={sendAudio} />
    </div>
  );
}
