import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MapPin, Smile, Paperclip, Video, CheckCheck, Image as ImageIcon, User, Info, MoreVertical, Phone, CreditCard, X } from 'lucide-react';

// ==========================================
// ⚠️ CRITICAL: PASTE YOUR RENDER URL BELOW ⚠️
// ==========================================
const socket = io('https://final-chat-demo.onrender.com'); // Example: 'https://chat-backend-final.onrender.com'

const FullFeatureChatApp = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(''); 
  const [messages, setMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [isCalling, setIsCalling] = useState(false); // Controls the simulated call screen
  
  const chatEndRef = useRef(null);

  const quickEmojis = ['😀','😂','🥰','😎','😭','😡','👍','🙏','🚀','✅'];
  const dummyStickers = [
    'https://cdn-icons-png.flaticon.com/512/8065/8065529.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392524.png',
    'https://cdn-icons-png.flaticon.com/512/6188/6188688.png'
  ];

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

  const sendPayload = (type, content = {}) => {
    const now = new Date();
    const newMsg = {
      id: Date.now(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      sender: 'me',
      senderName: username,
      type: type,
      ...content
    };
    
    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setShowMenu('');
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    sendPayload('text', { text: inputText });
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendText();
  };

  // ==========================================
  // SCREEN 1: LOGIN
  // ==========================================
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#eef2f6] font-sans p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-white/50 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform rotate-3">
            <User size={40} className="text-white transform -rotate-3" />
          </div>
          <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2">Join Session</h1>
          <form onSubmit={handleJoin} className="space-y-6 mt-8">
            <input 
              type="text" 
              placeholder="Display Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 font-semibold text-slate-800"
              autoFocus
            />
            <button type="submit" disabled={!username.trim()} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
              Start Messaging
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: SIMULATED CALLING OVERLAY
  // ==========================================
  if (isCalling) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center text-white font-sans animate-in fade-in duration-300">
        <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.5)]">
          <User size={64} className="text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Connecting to Network...</h2>
        <p className="text-slate-400 mb-12">End-to-end encrypted call</p>
        <button onClick={() => setIsCalling(false)} className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95">
          <Phone size={32} className="transform rotate-[135deg]" />
        </button>
      </div>
    );
  }

  // ==========================================
  // SCREEN 3: MAIN CHAT APP
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5] font-sans text-slate-800 sm:p-6 p-0">
      <div className="w-full max-w-4xl sm:h-[90vh] h-[100dvh] bg-white sm:rounded-[2.5rem] rounded-none shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between z-30 border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full flex items-center justify-center text-blue-700 font-extrabold text-xl uppercase shadow-sm">
              {username.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">Global Network <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">LIVE</span></h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsCalling(true)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors hidden sm:flex"><Phone size={20} /></button>
            <button onClick={() => setIsCalling(true)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Video size={20} /></button>
            <MoreVertical size={20} className="text-slate-400" />
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-[140px] space-y-6" onClick={() => setShowMenu('')}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
              
              {msg.sender === 'them' && <span className="text-[11px] font-bold text-slate-400 ml-2 mb-1 uppercase">{msg.senderName}</span>}

              {/* TEXT MESSAGE */}
              {msg.type === 'text' && (
                <div onClick={() => setSelectedMsgId(selectedMsgId === msg.id ? null : msg.id)} className={`px-5 py-3.5 max-w-[80%] shadow-md cursor-pointer ${msg.sender === 'me' ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none'}`}>
                  <p className="text-[15px]">{msg.text}</p>
                  <div className="flex justify-end items-center gap-1.5 mt-2 -mb-1 opacity-70"><span className="text-[10px]">{msg.time}</span></div>
                </div>
              )}

              {/* STICKER MESSAGE */}
              {msg.type === 'sticker' && (
                <div className="bg-transparent p-1">
                  <img src={msg.url} alt="Sticker" className="w-32 h-32 object-contain drop-shadow-xl animate-bounce" />
                </div>
              )}

              {/* LOCATION MESSAGE */}
              {msg.type === 'location' && (
                <div className={`p-2 max-w-[250px] shadow-md rounded-2xl ${msg.sender === 'me' ? 'bg-blue-600 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'}`}>
                  <div className="h-32 bg-slate-200 rounded-xl flex items-center justify-center"><MapPin size={32} className="text-blue-500" /></div>
                  <p className={`text-sm font-bold mt-2 px-2 ${msg.sender === 'me' ? 'text-white' : 'text-slate-800'}`}>Shared Location</p>
                </div>
              )}

              {/* PAYMENT MESSAGE */}
              {msg.type === 'payment' && (
                <div className={`p-4 max-w-[250px] shadow-md rounded-2xl flex items-center gap-3 ${msg.sender === 'me' ? 'bg-emerald-500 rounded-tr-none text-white' : 'bg-white border border-slate-200 rounded-tl-none text-slate-800'}`}>
                  <CreditCard size={28} />
                  <div><p className="text-sm font-bold">Payment Sent</p><p className="text-xs opacity-80">₹ 500.00</p></div>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* INPUT BAR AND POPUP MENUS */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-white via-white to-transparent z-40">
          
          {/* EMOJI MENU */}
          {showMenu === 'emoji' && (
            <div className="absolute bottom-[90px] left-6 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex gap-2 animate-in slide-in-from-bottom-2">
              {quickEmojis.map(emoji => (
                <button key={emoji} onClick={() => {setInputText(inputText + emoji); setShowMenu('');}} className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
              ))}
            </div>
          )}

          {/* STICKER MENU */}
          {showMenu === 'sticker' && (
            <div className="absolute bottom-[90px] left-6 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex gap-4 animate-in slide-in-from-bottom-2">
              {dummyStickers.map((url, i) => (
                <img key={i} src={url} onClick={() => sendPayload('sticker', { url })} className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform" alt="sticker"/>
              ))}
            </div>
          )}

          {/* ATTACH MENU (LOCATION & PAY) */}
          {showMenu === 'attach' && (
            <div className="absolute bottom-[90px] left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-3 animate-in slide-in-from-bottom-2 w-48">
              <button onClick={() => sendPayload('location')} className="flex items-center gap-3 text-slate-700 hover:text-blue-600 font-semibold p-2 bg-slate-50 rounded-lg"><MapPin size={20}/> Share Location</button>
              <button onClick={() => sendPayload('payment')} className="flex items-center gap-3 text-slate-700 hover:text-emerald-600 font-semibold p-2 bg-slate-50 rounded-lg"><CreditCard size={20}/> Send Payment</button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 px-2">
             <button onClick={() => setShowMenu(showMenu === 'emoji' ? '' : 'emoji')} className="p-2.5 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-full hover:bg-slate-50"><Smile size={20}/></button>
             <button onClick={() => setShowMenu(showMenu === 'sticker' ? '' : 'sticker')} className="p-2.5 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-full hover:bg-slate-50"><ImageIcon size={20}/></button>
             <button onClick={() => setShowMenu(showMenu === 'attach' ? '' : 'attach')} className="p-2.5 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-full hover:bg-slate-50"><Paperclip size={20}/></button>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-full flex items-center p-2 shadow-2xl focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent text-slate-700 px-5 py-2.5 outline-none text-[15px] font-medium"
            />
            <button onClick={handleSendText} className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${inputText.trim().length > 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:scale-105' : 'bg-slate-100 text-slate-400'}`}>
              <Send size={18} className={inputText.trim().length > 0 ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FullFeatureChatApp;