import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Smile, Paperclip, Video, CheckCheck, Image as ImageIcon, User, Info, Phone, LogOut, MapPin, CreditCard } from 'lucide-react';

// IMPORTANT: Ensure this is your active Render Backend URL
// Example: const socket = io('https://your-backend-name.onrender.com');
const socket = io('https://final-chat-demo.onrender.com'); 

const FullFeatureChatApp = () => {
  // 1. LOCAL STORAGE: Remembers you on refresh
  const [username, setUsername] = useState(localStorage.getItem('chat_user') || '');
  const [isJoined, setIsJoined] = useState(!!localStorage.getItem('chat_user'));
  
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(''); 
  const [messages, setMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null); 
  
  const chatEndRef = useRef(null);

  // Dummy data for our menus
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
    if (username.trim().length > 0) {
      localStorage.setItem('chat_user', username.trim());
      setIsJoined(true);
    }
  };

  // SEND STANDARD TEXT
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

  // SEND STICKER, LOCATION, OR PAYMENT
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendText();
  };

  const handleMessageClick = (id) => {
    setSelectedMsgId(selectedMsgId === id ? null : id);
  };

  // ==========================================
  // SCREEN 1: LOGIN / ENTER NAME
  // ==========================================
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f9fc] to-[#eef2f6] font-sans p-4 relative overflow-hidden animate-in fade-in duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-white/50 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30 transform rotate-3">
            <User size={40} className="text-white transform -rotate-3" />
          </div>
          <h1 className="text-3xl font-extrabold text-center text-slate-800 mb-2 tracking-tight">Join the Session</h1>
          <p className="text-center text-slate-500 mb-10 font-medium">Enter your credentials to connect securely.</p>
          
          <form onSubmit={handleJoin} className="space-y-6">
            <input 
              type="text" 
              placeholder="Display Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white/50 text-slate-800 font-semibold placeholder-slate-400 transition-all shadow-sm"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:shadow-none hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Messaging
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: MAIN CHAT APP
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5] font-sans text-slate-800 sm:p-6 p-0 relative">
      <div className="w-full max-w-4xl sm:h-[90vh] h-[100dvh] bg-white sm:rounded-[2.5rem] rounded-none shadow-2xl border border-slate-100 flex flex-col relative overflow-hidden animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-30 border-b border-slate-100/80 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full flex items-center justify-center text-blue-700 font-extrabold text-xl shadow-sm ring-1 ring-blue-600/10 uppercase">
                {username.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-lg ring-1 ring-emerald-600/20"></div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                Global Network
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider uppercase">Live</span>
              </h1>
              <p className="text-sm font-medium text-slate-500">Connected as {username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors hidden sm:flex"><Phone size={20} /></button>
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Video size={20} /></button>
            
            <button 
              onClick={() => { localStorage.removeItem('chat_user'); window.location.reload(); }}
              className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer ml-2"
            >
              <LogOut size={14} /> Leave
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-[160px] z-10" 
          style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          onClick={() => setShowMenu('')}
        >
          <div className="flex justify-center mb-8">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-slate-200/50">
              End-to-End Encrypted Session
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-5 animate-in slide-in-from-bottom-2 duration-300`}>
              
              {/* SENDER NAME */}
              {msg.sender === 'them' && (
                <span className="text-[11px] font-bold text-slate-400 ml-2 mb-1 tracking-wider uppercase">{msg.senderName}</span>
              )}

              {/* 1. TEXT BUBBLE */}
              {msg.type === 'text' && (
                <div 
                  onClick={() => handleMessageClick(msg.id)}
                  className={`px-5 py-3 min-w-[80px] max-w-[85%] sm:max-w-[75%] shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    msg.sender === 'me' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-blue-500/20' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none'
                  }`}
                >
                  <div className="flex items-end justify-between gap-4">
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                    {msg.sender === 'me' && <CheckCheck size={16} className="text-blue-300 opacity-90 shrink-0" />}
                  </div>
                </div>
              )}

              {/* 2. STICKER IMAGE */}
              {msg.type === 'sticker' && (
                <div onClick={() => handleMessageClick(msg.id)} className="cursor-pointer hover:scale-105 transition-transform">
                  <img src={msg.url} alt="Sticker" className="w-32 h-32 object-contain drop-shadow-xl" />
                </div>
              )}

              {/* 3. LOCATION CARD */}
              {msg.type === 'location' && (
                <div onClick={() => handleMessageClick(msg.id)} className={`p-2 max-w-[75%] w-64 shadow-md cursor-pointer transition-all hover:scale-[1.02] ${msg.sender === 'me' ? 'bg-blue-600 rounded-2xl rounded-tr-none' : 'bg-white border border-slate-200 rounded-2xl rounded-tl-none'}`}>
                  <div className="h-28 bg-slate-200 rounded-xl overflow-hidden relative">
                     <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover" />
                     <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"><MapPin size={20} className="text-blue-500" /></div></div>
                  </div>
                  <div className={`px-2 py-2 flex justify-between items-center ${msg.sender === 'me' ? 'text-white' : 'text-slate-800'}`}>
                    <p className="text-sm font-bold">Live Location</p>
                    {msg.sender === 'me' && <CheckCheck size={16} className="text-blue-300" />}
                  </div>
                </div>
              )}

              {/* 4. PAYMENT CARD */}
              {msg.type === 'payment' && (
                <div onClick={() => handleMessageClick(msg.id)} className={`p-4 max-w-[75%] w-64 shadow-md cursor-pointer transition-all hover:scale-[1.02] ${msg.sender === 'me' ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><CreditCard size={20} className={msg.sender === 'me' ? 'text-white' : 'text-purple-600'} /></div>
                    <div>
                      <p className="font-bold text-lg">₹ 1,500</p>
                      <p className="text-xs opacity-80">Payment Request</p>
                    </div>
                  </div>
                  <button className={`w-full py-2 mt-2 rounded-lg text-sm font-bold ${msg.sender === 'me' ? 'bg-white/20 hover:bg-white/30' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>Pay Now</button>
                </div>
              )}

              {/* CLICK TO SHOW DETAILS DRAWER */}
              {selectedMsgId === msg.id && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm animate-in slide-in-from-top-1 duration-200">
                  <Info size={14} className="text-blue-500" />
                  <span>{msg.sender === 'me' ? 'Delivered to server' : 'Received'} at {msg.time}</span>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* FLOATING INPUT BAR & MENUS */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#f0f2f5] via-[#f0f2f5]/90 to-transparent z-40">
          
          {/* POPUP MENUS */}
          <div className="relative">
            {showMenu === 'emoji' && (
              <div className="absolute bottom-16 left-2 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 flex gap-2 animate-in slide-in-from-bottom-2">
                {quickEmojis.map(e => <button key={e} onClick={()=>setInputText(prev=>prev+e)} className="text-2xl hover:scale-110 transition">{e}</button>)}
              </div>
            )}
            {showMenu === 'sticker' && (
              <div className="absolute bottom-16 left-12 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 flex gap-3 animate-in slide-in-from-bottom-2">
                {dummyStickers.map((s,i) => <img key={i} src={s} alt="sticker" onClick={()=>sendPayload('sticker', {url: s})} className="w-16 h-16 cursor-pointer hover:scale-105 transition" />)}
              </div>
            )}
            {showMenu === 'attach' && (
              <div className="absolute bottom-16 left-24 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 flex flex-col gap-2 animate-in slide-in-from-bottom-2 min-w-[180px]">
                <button onClick={()=>sendPayload('location')} className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:bg-slate-50 p-2 rounded-lg w-full text-left transition"><MapPin size={18} className="text-emerald-500"/> Share Location</button>
                <button onClick={()=>sendPayload('payment')} className="flex items-center gap-3 text-sm font-bold text-slate-700 hover:bg-slate-50 p-2 rounded-lg w-full text-left transition"><CreditCard size={18} className="text-purple-500"/> Request Payment</button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3 px-2">
             <button onClick={() => setShowMenu(showMenu === 'emoji' ? '' : 'emoji')} className={`p-2.5 rounded-full transition ${showMenu === 'emoji' ? 'bg-blue-100 text-blue-700' : 'bg-white shadow-sm border border-slate-200 text-slate-400 hover:bg-slate-50'}`}><Smile size={20}/></button>
             <button onClick={() => setShowMenu(showMenu === 'sticker' ? '' : 'sticker')} className={`p-2.5 rounded-full transition ${showMenu === 'sticker' ? 'bg-blue-100 text-blue-700' : 'bg-white shadow-sm border border-slate-200 text-slate-400 hover:bg-slate-50'}`}><ImageIcon size={20}/></button>
             <button onClick={() => setShowMenu(showMenu === 'attach' ? '' : 'attach')} className={`p-2.5 rounded-full transition ${showMenu === 'attach' ? 'bg-blue-100 text-blue-700' : 'bg-white shadow-sm border border-slate-200 text-slate-400 hover:bg-slate-50'}`}><Paperclip size={20}/></button>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full flex items-center p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all duration-300">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              onClick={() => setShowMenu('')}
              className="flex-1 bg-transparent text-slate-700 px-5 py-2.5 outline-none text-[15px] font-medium placeholder-slate-400"
            />
            <button 
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${inputText.trim().length > 0 ? 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer transform scale-100' : 'bg-slate-100 text-slate-400 cursor-default transform scale-95'}`}
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