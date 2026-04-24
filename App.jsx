import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MapPin, Smile, Paperclip, Video, CheckCheck, Image as ImageIcon, User, Info, ShieldCheck, MoreVertical } from 'lucide-react';

// ⚠️ IMPORTANT: Paste your working Render URL here!
const socket = io('https://your-render-url-here.onrender.com');

const FullFeatureChatApp = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(''); 
  const [messages, setMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      const incomingMsg = { ...data, sender: 'them' };
      setMessages((prev) => [...prev, incomingMsg]);
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showMenu, selectedMsgId]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim().length > 0) setIsJoined(true);
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    
    const now = new Date();
    const newMsg = {
      id: Date.now(),
      text: inputText,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      sender: 'me',
      senderName: username,
      type: 'text'
    };

    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setInputText('');
    setShowMenu('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendText();
  };

  const handleMessageClick = (id) => {
    setSelectedMsgId(selectedMsgId === id ? null : id);
  };

  // ==========================================
  // SCREEN 1: PREMIUM LOGIN
  // ==========================================
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] font-sans p-4">
        {/* Glassmorphism Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.3)] p-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">Secure Connect</h1>
          <p className="text-center text-slate-300 mb-8 text-sm font-medium">Enterprise-grade live messaging platform.</p>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Enter your alias..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black/20 text-white placeholder-slate-400 font-medium transition-all"
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
            >
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: MAIN CHAT APP (Standard Impression)
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-sans text-slate-800 p-2 sm:p-6">
      <div className="w-full max-w-4xl h-[92vh] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col relative overflow-hidden">
        
        {/* HEADER - Corporate & Clean */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20 absolute top-0 w-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md uppercase">
                {username.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2.5px] border-white shadow-sm"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Global Channel</h1>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
             <button className="p-2 hover:bg-slate-100 rounded-full transition"><Video size={20} /></button>
             <button className="p-2 hover:bg-slate-100 rounded-full transition"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* CHAT AREA - Modern Bubble Design */}
        <div className="flex-1 overflow-y-auto px-6 pt-28 pb-[140px] space-y-6 bg-[#f8fafc] z-10" onClick={() => setShowMenu('')}>
          <div className="flex justify-center mb-8">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full shadow-sm">
              End-to-End Encrypted Session
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
              
              {msg.sender === 'them' && (
                <span className="text-xs font-semibold text-slate-500 ml-2 mb-1">{msg.senderName}</span>
              )}

              {/* MESSAGE BUBBLES - Refined Curves */}
              {msg.type === 'text' && (
                <div 
                  onClick={() => handleMessageClick(msg.id)}
                  className={`px-5 py-3.5 max-w-[80%] sm:max-w-[70%] cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                    msg.sender === 'me' 
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl rounded-br-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-3xl rounded-bl-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className={`flex justify-end items-center gap-1.5 mt-1.5 -mb-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-slate-400'}`}>
                    <span className="text-[10px] font-medium tracking-wide">{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck size={14} />}
                  </div>
                </div>
              )}

              {/* TIMESTAMP DROPDOWN - Apple Style */}
              {selectedMsgId === msg.id && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 z-0">
                  <Info size={14} className="text-indigo-500" />
                  <span>{msg.sender === 'me' ? 'Delivered' : 'Received'} • {msg.fullDate} at {msg.time}</span>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR - Floating Island Design */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-6 px-6 z-30">
          <div className="bg-white border border-slate-200 shadow-lg rounded-full flex items-center p-1.5 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
            
            <button onClick={() => setShowMenu(showMenu === 'attach' ? '' : 'attach')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition">
              <Paperclip size={20}/>
            </button>
            
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              onClick={() => setShowMenu('')}
              className="flex-1 bg-transparent text-slate-800 px-3 outline-none text-[15px] font-medium placeholder-slate-400"
            />
            
            <button onClick={() => setShowMenu(showMenu === 'emoji' ? '' : 'emoji')} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition mr-1">
              <Smile size={20}/>
            </button>

            <button 
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md ${
                inputText.trim().length > 0 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-500/30 hover:scale-105 cursor-pointer' 
                : 'bg-slate-100 text-slate-400 cursor-default shadow-none'
              }`}
              onClick={inputText.trim().length > 0 ? handleSendText : null}
            >
              <Send size={18} className={inputText.trim().length > 0 ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FullFeatureChatApp;