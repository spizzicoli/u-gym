import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatInputBar from '../components/ChatInputBar';
import { sendChatMessage, subscribeToMessages } from '../lib/chat';
import './CommunityPage.scss';
const formatTime = value => value ? new Date(value).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}) : '';

export default function TrainerChat() {
  const { user } = useApp();
  const [messages,setMessages]=useState([]); const [error,setError]=useState(''); const endRef=useRef(null);
  const trainerId=user?.role==='trainer'?user.id:user?.trainer_id;
  useEffect(() => {
    if(!trainerId||!user?.id) return undefined;
    return subscribeToMessages({type:'trainer',userId:user.id,trainerId,onMessages:setMessages,onError:e=>{console.error(e);setError('Impossibile caricare la chat.');}});
  },[trainerId,user?.id]);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),[messages.length]);
  if(!trainerId) return <div className="chat no-trainer"><div className="banner"><div className="banner-icon">👋</div><h3>Nessun Personal Trainer assegnato</h3><p>Quando la palestra ti assegnerà un PT, qui potrai scrivergli direttamente.</p></div></div>;
  const sendText=async(text,reset)=>{if(!text.trim())return;try{await sendChatMessage('pt_messages',{type:'text',message:text,trainer_id:trainerId,user_id:user.id,username:user.username});reset('');}catch(e){setError('Messaggio non inviato. Riprova.');throw e;}};
  return <div className="chat">
    <div className="chat-topbar"><div><strong>Personal Trainer</strong><span>Conversazione privata</span></div><span className="chat-lock">🔒</span></div>
    {error&&<div className="chat-inline-error">{error}</div>}
    <div className="messages"><div className="chat-system-note">Questa chat è privata tra te e il tuo Personal Trainer.</div>
      {messages.map(message=>{const isMine=message.user_id===user.id;return <div key={message.id} className={`message ${isMine?'mine':'other'}`}>{!isMine&&<div className="author">Personal Trainer</div>}<div className="message-row"><div className="bubble">{String(message.message||'')}<span className="bubble-time">{formatTime(message.created_at)}</span></div></div></div>})}
      <div ref={endRef}/></div>
    <ChatInputBar onSendText={sendText} disabled={!!error&&messages.length===0}/>
  </div>;
}
