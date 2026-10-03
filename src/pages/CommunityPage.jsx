import React, { Component, useState } from 'react';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import './CommunityPage.scss';
import CommunityChat from './CommunityChat';
import TrainerChat from './TrainerChat';

class ChatErrorBoundary extends Component {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(error) { console.error('Community chat crash:', error); }
  render() {
    if (this.state.crashed) return <div className="chat chat-error-state"><div className="chat-recovery"><span>💬</span><strong>La chat ha avuto un problema</strong><p>Nessun messaggio è stato cancellato. Riavviare questa sezione dovrebbe ripristinarla.</p><button onClick={() => this.setState({ crashed: false })}>Ricarica chat</button></div></div>;
    return this.props.children;
  }
}

export default function CommunityPage() {
  const [tab, setTab] = useState('community');
  return (
    <div className="community-page">
      <div className="tabs" role="tablist" aria-label="Chat U-GYM">
        <button className={`tab ${tab === 'community' ? 'active' : ''}`} onClick={() => setTab('community')} role="tab" aria-selected={tab === 'community'}><ForumRoundedIcon sx={{fontSize:18,verticalAlign:'middle',mr:.5}}/> Utenti</button>
        <button className={`tab ${tab === 'trainer' ? 'active' : ''}`} onClick={() => setTab('trainer')} role="tab" aria-selected={tab === 'trainer'}><FitnessCenterRoundedIcon sx={{fontSize:18,verticalAlign:'middle',mr:.5}}/> Personal Trainer</button>
      </div>
      <div className="chat-container"><ChatErrorBoundary>{tab === 'community' ? <CommunityChat/> : <TrainerChat/>}</ChatErrorBoundary></div>
    </div>
  );
}
