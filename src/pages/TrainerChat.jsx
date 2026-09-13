import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatInputBar from '../components/ChatInputBar';
import { sendChatMessage, subscribeToMessages, uploadChatFile } from '../lib/chat';
import './CommunityPage.scss';

export default function TrainerChat() {
  const { user } = useApp();
  const [messages, setMessages] = useState([]);
  const trainerId = user?.role === 'trainer' ? user.id : user?.trainer_id;

  useEffect(() => {
    if (!trainerId) return undefined;
    return subscribeToMessages('pt_messages', trainerId, setMessages);
  }, [trainerId]);

  const sendText = async (text, reset) => {
    if (!text.trim() || !trainerId) return;
    await sendChatMessage('pt_messages', { type: 'text', message: text, trainer_id: trainerId, user_id: user.id, username: user.username });
    reset('');
  };

  const sendImage = async (file) => {
    if (!trainerId) return;
    const imageUrl = await uploadChatFile(file, user.id, `trainer-${trainerId}`);
    await sendChatMessage('pt_messages', { type: 'image', image_url: imageUrl, trainer_id: trainerId, user_id: user.id, username: user.username });
  };

  const sendAudio = async () => console.log('Registrazione audio non ancora disponibile');

  if (!trainerId) {
    return <div className="chat no-trainer"><div className="banner"><h3>Nessun Personal Trainer assegnato</h3><p>A breve ti verrà assegnato un personal trainer.</p></div></div>;
  }

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
