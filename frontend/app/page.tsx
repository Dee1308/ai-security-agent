"use client";

import { useState, useEffect } from "react";

interface Anomaly {
  timestamp: str;
  user: string;
  ip: string;
  event: string;
  location: string;
  threat_level: string;
  explanation: string;
  remediation: string;
}

interface TriageData {
  total_processed: number;
  false_positives_filtered: number;
  critical_threats_blocked: number;
  escalated_anomalies: Anomaly[];
}

interface ChatMessage {
  sender: "user" | "agent";
  text: string;
}

export default function Dashboard() {
  const [data, setData] = useState<TriageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { sender: "agent", text: "Systems online. Ask me anything about current network threats." }
  ]);

  // Pull dynamic data structures right from our FastAPI backend server
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/triage")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
        if (resData?.escalated_anomalies?.length > 0) {
          setSelectedIp(resData.escalated_anomalies[0].ip);
        }
      })
      .catch((err) => {
        console.error("Error communicating with API backend:", err);
        setLoading(false);
      });
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory((prev) => [...prev, { sender: "user", text: userMsg }]);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const chatData = await response.json();
      setChatHistory((prev) => [...prev, { sender: "agent", text: chatData.response }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: "agent", text: "⚠️ Technical communication error with local engine." }]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">Synchronizing AI Core Triaging Tables...</p>
      </div>
    );
  }

  // Bulletproof fallback to catch empty states before rendering lookup attributes
  const currentThreat = data?.escalated_anomalies?.find(t => t.ip === selectedIp) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      
      {/* Header Banner */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-emerald-400">Aegis-X // AI threat command center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated SOC Log Triaging Agent Architecture</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono font-medium text-emerald-400 tracking-wider">SIMULATOR ACTIVE</span>
        </div>
      </header>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Log Stream Processed</p>
          <p className="text-3xl font-bold font-mono text-slate-100 mt-1">{data?.total_processed || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">False Positives Suppressed</p>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">{data?.false_positives_filtered || 0}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Vulnerabilities Escalated / Blocked</p>
          <p className="text-3xl font-bold font-mono text-rose-500 mt-1">{data?.critical_threats_blocked || 0}</p>
        </div>
      </div>

      {/* Workspace Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Interactive Feed Table */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Escalated Anomalies Queue</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] uppercase text-slate-400 tracking-wider">
                    <th className="py-2 px-3">IP / Destination</th>
                    <th className="py-2 px-3">Identified Vector</th>
                    <th className="py-2 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
                  {data?.escalated_anomalies?.map((threat) => (
                    <tr 
                      key={threat.ip} 
                      onClick={() => setSelectedIp(threat.ip)}
                      className={`cursor-pointer transition-all ${selectedIp === threat.ip ? "bg-slate-800 border-l-2 border-emerald-500" : "hover:bg-slate-800/40"}`}
                    >
                      <td className="py-3 px-3 text-slate-200 font-semibold">{threat.ip}</td>
                      <td className="py-3 px-3 text-slate-300">{threat.event}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          threat.threat_level === "Critical" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : 
                          threat.threat_level === "High" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {threat.threat_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Deep-Dive Inspection Panel */}
          {currentThreat && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-bold tracking-wider text-slate-200">Incident Inspection Panel // IP: {currentThreat.ip}</h3>
                <span className="text-xs text-slate-400 font-mono">{currentThreat.timestamp}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800/80 mb-4">
                <p><span className="text-slate-500">Targeted Host User:</span> {currentThreat.user}</p>
                <p><span className="text-slate-500">Origin Location:</span> {currentThreat.location}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">AI Threat Evaluation:</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800/40">{currentThreat.explanation}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase text-emerald-400">Remediation Script:</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-emerald-500/5 p-3 rounded border border-emerald-500/10">{currentThreat.remediation}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chatbot Sidebar Workspace */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-[520px]">
          <div className="border-b border-slate-800 pb-2 mb-3">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">CISO Security Co-Pilot Chat</h3>
          </div>
          
          {/* Messages Log Container */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 bg-slate-950 border border-slate-800/60 rounded font-mono text-xs">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`p-2 rounded max-w-[90%] ${msg.sender === "user" ? "bg-slate-800 ml-auto text-right text-slate-200" : "bg-slate-900 mr-auto text-left text-emerald-400 border border-slate-800/40"}`}>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">{msg.sender === "user" ? "ANALYST" : "AGENT"}</p>
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Form Action Handler */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about an anomaly or threat status..." 
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-slate-700"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 transition-colors text-white px-4 py-2 rounded text-xs uppercase font-bold tracking-wider">
              Query
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}