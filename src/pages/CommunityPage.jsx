import React, { useState } from "react";
import "./CommunityPage.scss";
import CommunityChat from "./CommunityChat";
import TrainerChat from "./TrainerChat";

export default function CommunityPage() {
  const [tab, setTab] = useState("community");

  return (
    <div className="community-page">
      <div className="tabs">
        <button
          className={`tab ${tab === "community" ? "active" : ""}`}
          onClick={() => setTab("community")}
        >
          Community
        </button>

        <button
          className={`tab ${tab === "trainer" ? "active" : ""}`}
          onClick={() => setTab("trainer")}
        >
          Personal Trainer
        </button>
      </div>

      <div className="chat-container">
        {tab === "community" && <CommunityChat />}
        {tab === "trainer" && <TrainerChat />}
      </div>
    </div>
  );
}
