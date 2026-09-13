import React, { useState } from "react";
import { IconButton, TextField } from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import ImageIcon from "@mui/icons-material/Image";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export default function ChatInputBar({ onSendText, onSendImage, onSendAudio }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmoji = (emoji) => {
    setText((prev) => prev + emoji.native);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) onSendImage(file);
  };

  return (
    <div className="chat-input-bar">
      <IconButton onClick={() => setShowEmoji(!showEmoji)}>
        <EmojiEmotionsIcon style={{ color: "#3ddc84" }} />
      </IconButton>

      <IconButton component="label">
        <ImageIcon style={{ color: "#3ddc84" }} />
        <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
      </IconButton>

      <IconButton onClick={onSendAudio}>
        <MicIcon style={{ color: "#3ddc84" }} />
      </IconButton>

      <TextField
        variant="outlined"
        size="small"
        placeholder="Scrivi un messaggio..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSendText(text, setText)}
        sx={{
          flexGrow: 1,
          background: "#1a1c1f",
          borderRadius: "12px",
          input: { color: "#f0f0f0" },
          width: '80%',
          marginLeft: '2%',
          marginRight: '5%',
          marginBottom: '15px',
        }}
      />

      <IconButton onClick={() => onSendText(text, setText)}>
        <SendIcon style={{ color: "#3ddc84" }} />
      </IconButton>

      {showEmoji && (
        <div className="emoji-picker">
          <Picker data={data} onEmojiSelect={handleEmoji} theme="dark" />
        </div>
      )}
    </div>
  );
}
