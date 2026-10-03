import React, { useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import SendIcon from '@mui/icons-material/Send';

const QUICK_EMOJIS = ['😀','😂','😍','🔥','💪','👏','🙌','👍','❤️','🎯','🏋️','🏃','😅','🤝','🥳','😎','⚡','✨','🙏','👋'];

export default function ChatInputBar({ onSendText, disabled = false }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

  const submit = async () => {
    const value = text.trim();
    if (!value || disabled) return;
    try { await onSendText(value, setText); setShowEmoji(false); } catch (e) { console.error('Invio messaggio:', e); }
  };

  const addEmoji = emoji => {
    setText(prev => `${prev}${emoji}`);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="chat-input-shell">
      {showEmoji && <div className="emoji-picker" role="dialog" aria-label="Emoji">
        <div className="emoji-grid">{QUICK_EMOJIS.map(emoji => <button key={emoji} type="button" onClick={() => addEmoji(emoji)}>{emoji}</button>)}</div>
      </div>}
      <div className="chat-input-bar">
        <IconButton onClick={() => setShowEmoji(v => !v)} disabled={disabled} aria-label="Emoji"><EmojiEmotionsIcon /></IconButton>
        <div className="chat-text-wrap">
          <input
            ref={inputRef}
            className="chat-text-input"
            placeholder="Scrivi un messaggio"
            value={text}
            disabled={disabled}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
          />
        </div>
        <IconButton onClick={submit} disabled={!text.trim() || disabled} aria-label="Invia"><SendIcon /></IconButton>
      </div>
    </div>
  );
}
