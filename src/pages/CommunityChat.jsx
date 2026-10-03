import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatInputBar from '../components/ChatInputBar';
import { sendChatMessage, subscribeToMessages } from '../lib/chat';
import './CommunityPage.scss';

const formatTime = value => value ? new Date(value).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}) : '';

export default function CommunityChat() {
  const { user, selectedGym } = useApp();
  const [messages,setMessages] = useState([]);
  const [error,setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    setError('');
    const unsubscribe = subscribeToMessages({
      type:'community', userId:user.id, gymId:selectedGym?.id,
      onMessages: value => { setMessages(Array.isArray(value) ? value : []); },
      onError: e => { console.error('Community listener:',e); setError('Impossibile caricare la chat. Controlla la connessione.'); },
    });
    return unsubscribe;
  }, [user?.id, selectedGym?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages.length]);

  const sendText = async (text, reset) => {
    if (!text.trim() || !user?.id) return;
    try {
      await sendChatMessage('community_messages',{type:'text',message:text,user_id:user.id,username:user.username||'Utente',gym_id:selectedGym?.id||null});
      reset('');
    } catch (e) { setError('Messaggio non inviato. Riprova.'); throw e; }
  };

  return <div className="chat">
    <div className="chat-topbar"><div><strong>Community</strong><span>{selectedGym?.name || 'Tutti gli utenti'}</span></div><span className="chat-online-dot">● attiva</span></div>
    {error && <div className="chat-inline-error">{error}</div>}
    <div className="messages">
      {messages.length===0 && !error && <div className="chat-empty"><span>💬</span><strong>Nessun messaggio ancora</strong><small>Sii tu il primo a salutare la community.</small></div>}
      {messages.map(message => {
        const isMine=message.user_id===user.id;
        return <div key={message.id} className={`message ${isMine?'mine':'other'}`}>
          {!isMine && <div className="author">{message.username}</div>}
          <div className="message-row"><div className="bubble">{String(message.message || '')}<span className="bubble-time">{formatTime(message.created_at)}</span></div></div>
        </div>;
      })}
      <div ref={endRef}/>
    </div>
    <ChatInputBar onSendText={sendText} disabled={!!error && messages.length===0}/>
  </div>;
}
