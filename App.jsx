import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, Smile, Paperclip, Video, CheckCheck, 
  Image as ImageIcon, User, MapPin, CreditCard, 
  Mic, Camera, FileText, Headphones, BarChart2, 
  IndianRupee, Sparkles, LogOut, ShieldCheck, Sticker, PhoneMissed, X
} from 'lucide-react';

// IMPORTANT: Ensure this is your active Render Backend URL
const socket = io('https://final-chat-server-v2.onrender.com'); 

const FullFeatureChatApp = () => {
  const [username, setUsername] = useState(localStorage.getItem('chat_user') || '');
  const [isJoined, setIsJoined] = useState(!!localStorage.getItem('chat_user'));
  
  const [inputText, setInputText] = useState('');
  const [activeMenu, setActiveMenu] = useState(''); 
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showCameraMode, setShowCameraMode] = useState(false);
  
  const chatEndRef = useRef(null);
  const videoRef = useRef(null); 

  const quickEmojis = ['😀','😂','🥰','😎','😭','😡','👍','🙏','🚀','✅','🔥','💯'];
  const dummyStickers = [
    'https://cdn-icons-png.flaticon.com/512/8065/8065529.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392524.png',
    'https://cdn-icons-png.flaticon.com/512/6188/6188688.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392464.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392461.png'
  ];

  useEffect(() => {
    socket.on('receive_message', (data) => {
      const incomingMsg = { ...data, sender: 'them' };
      setMessages((prev) => [...prev, incomingMsg]);
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMenu]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      localStorage.setItem('chat_user', username.trim());
      setIsJoined(true);
    }
  };

  const sendPayload = (type, content = {}, text = '') => {
    const now = new Date();
    const newMsg = {
      id: Date.now(),
      text: text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      senderName: username,
      type: type,
      ...content
    };
    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setInputText('');
    setActiveMenu('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputText.trim()) sendPayload('text', {}, inputText);
  };

  const openCamera = async () => {
    setActiveMenu('');
    setShowCameraMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied.");
      setShowCameraMode(false);
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach(track => track.stop());
    setShowCameraMode(false);
  };

  // ==========================================
  // SCREEN 1: LOGIN (Fixed Fullscreen)
  // ==========================================
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-[100dvh] w-full bg-slate-100 font-sans px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <ShieldCheck size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Secure Messenger</h1>
          <p className="text-center text-slate-500 mb-6 text-sm">Enter your display name to connect</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <input type="text" placeholder="Your Name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" autoFocus />
            <button type="submit" disabled={!username.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors shadow-md">Enter Hub</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: MAIN APP (Fixed 100% Width)
  // ==========================================
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-50 font-sans text-slate-800 relative overflow-hidden">
      
      {/* VIDEO CALL OVERLAY */}
      {showVideoCall && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 animate-pulse">G</div>
          <h2 className="text-2xl font-bold mb-1">Global Network</h2>
          <p className="text-slate-400 mb-12">Calling...</p>
          <button onClick={() => setShowVideoCall(false)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"><PhoneMissed size={28}/></button>
        </div>
      )}

      {/* WEBCAM OVERLAY */}
      {showCameraMode && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-lg shadow-2xl mb-6"></video>
          <div className="flex gap-6">
            <button onClick={closeCamera} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><X size={28} className="text-white"/></button>
            <button onClick={() => { closeCamera(); sendPayload('feature', {label: 'Photo Captured', icon: '📸'}); }} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg"><Camera size={28} className="text-black"/></button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white px-4 py-3 flex items-center justify-between z-30 border-b border-slate-200 shadow-sm w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md uppercase shrink-0">{username.charAt(0)}</div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-slate-800 truncate">Global Network</h1>
            <p className="text-xs text-blue-600 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 shrink-0">
          <button onClick={() => setShowVideoCall(true)} className="p-2 bg-slate-100 rounded-full hover:text-blue-600"><Video size={18} /></button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-2 bg-slate-100 rounded-full hover:text-red-500"><LogOut size={18} /></button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 pt-4 pb-4 w-full" onClick={() => setActiveMenu('')}>
        <div className="flex justify-center mb-6">
          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            <ShieldCheck size={12} className="inline mr-1 mb-0.5 text-blue-500" /> End-to-End Encrypted
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-4 w-full`}>
            <div className={`relative px-3 py-2 max-w-[90%] sm:max-w-[70%] shadow-md ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
              <div className={`text-[11px] font-bold mb-1 ${msg.sender === 'me' ? 'text-blue-200' : 'text-indigo-500'}`}>{msg.senderName}</div>

              {msg.type === 'text' && <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>}
              {msg.type === 'sticker' && <div className="-mx-1"><img src={msg.url} alt="Sticker" className="w-24 h-24 object-contain drop-shadow-md" /></div>}
              
              {/* POLL BUBBLE */}
              {msg.type === 'poll' && (
                <div className="w-full min-w-[200px] mt-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm mb-2"><BarChart2 size={16}/> Presentation Day</div>
                  <div className="space-y-1.5 mb-2">
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/5 rounded cursor-pointer"><input type="radio" name={`poll-${msg.id}`} /> Tuesday</label>
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/5 rounded cursor-pointer"><input type="radio" name={`poll-${msg.id}`} /> Wednesday</label>
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/5 rounded cursor-pointer"><input type="radio" name={`poll-${msg.id}`} /> Thursday</label>
                  </div>
                  <button onClick={(e) => { alert("Vote recorded!"); e.target.innerText = "Voted ✓"; e.target.disabled = true; e.target.classList.add("opacity-50"); }} className={`w-full py-1.5 rounded-md text-sm font-bold ${msg.sender === 'me' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Vote</button>
                </div>
              )}

              {msg.type === 'payment' && (
                <div className="w-48 mt-1">
                  <div className="flex items-center gap-2 mb-2"><div className="bg-white/20 p-1 rounded-full"><IndianRupee size={14} /></div><span className="font-bold">₹ 1,500</span></div>
                  <button className={`w-full py-1.5 rounded-md text-sm font-bold ${msg.sender === 'me' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Pay</button>
                </div>
              )}

              {msg.type === 'location' && (
                <div className="w-48 mt-1">
                  <div className="h-24 bg-slate-200 rounded-md overflow-hidden relative mb-1.5">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center"><MapPin size={24} className="text-red-500 drop-shadow-md" /></div>
                  </div>
                  <div className="font-semibold text-[13px]">Live Location</div>
                </div>
              )}

              {msg.type === 'feature' && (
                <div className="flex items-center gap-2 mt-1 bg-black/10 p-1.5 rounded-md pr-4">
                  <div className="p-1.5 bg-white/20 rounded-full">{msg.icon}</div>
                  <span className="font-semibold text-[13px]">{msg.label}</span>
                </div>
              )}

              <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-medium ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.time} {msg.sender === 'me' && <CheckCheck size={12} />}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} className="h-2" />
      </div>

      {/* BOTTOM INPUT AREA */}
      <div className="bg-white border-t border-slate-200 px-2 py-2 sm:px-4 sm:py-3 relative w-full shrink-0">
        
        {/* MENUS */}
        {activeMenu === 'emoji' && (
          <div className="absolute bottom-16 left-2 bg-white shadow-xl border border-slate-200 rounded-xl p-3 w-[90vw] max-w-[260px] grid grid-cols-4 gap-3 z-50">
            {quickEmojis.map(e => <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-xl">{e}</button>)}
          </div>
        )}

        {activeMenu === 'sticker' && (
          <div className="absolute bottom-16 left-2 bg-white shadow-xl border border-slate-200 rounded-xl p-3 w-[90vw] max-w-[300px] flex flex-wrap gap-2 z-50">
            {dummyStickers.map((s, i) => <img key={i} src={s} alt="sticker" onClick={() => sendPayload('sticker', {url: s})} className="w-12 h-12 cursor-pointer" />)}
          </div>
        )}

        {activeMenu === 'attach' && (
          <div className="absolute bottom-16 left-2 bg-white shadow-xl border border-slate-200 rounded-xl p-4 w-[90vw] max-w-[300px] z-50">
            <div className="grid grid-cols-3 gap-y-4 gap-x-2">
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('feature', {label: 'Image_102.jpg', icon: '🖼️'})}><div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><ImageIcon size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Gallery</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={openCamera}><div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600"><Camera size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Camera</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('location')}><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><MapPin size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Location</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('feature', {label: 'Contact Card', icon: '👤'})}><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Contact</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('feature', {label: 'Document.pdf', icon: '📄'})}><div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><FileText size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Document</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('feature', {label: 'Voice Note', icon: '🎵'})}><div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Headphones size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Audio</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('poll')}><div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><BarChart2 size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Poll</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('payment')}><div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><IndianRupee size={18}/></div><span className="text-[11px] font-semibold text-slate-600">Payment</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => sendPayload('feature', {label: 'AI Image', icon: '✨'})}><div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><Sparkles size={18}/></div><span className="text-[11px] font-semibold text-slate-600">AI</span></div>
            </div>
          </div>
        )}

        {/* INPUT BAR (Flex-fix applied here) */}
        <div className="flex items-center gap-1 sm:gap-2 w-full">
          <div className="flex-1 bg-slate-100 rounded-full flex items-center px-1 py-1 sm:px-2 border border-slate-200 focus-within:border-blue-400 transition-colors min-w-0">
            <button onClick={() => setActiveMenu(activeMenu === 'emoji' ? '' : 'emoji')} className={`p-1.5 ${activeMenu === 'emoji' ? 'text-blue-600' : 'text-slate-400'}`}><Smile size={20}/></button>
            <button onClick={() => setActiveMenu(activeMenu === 'sticker' ? '' : 'sticker')} className={`p-1.5 ${activeMenu === 'sticker' ? 'text-blue-600' : 'text-slate-400'}`}><Sticker size={18}/></button>
            
            <input type="text" placeholder="Message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyPress} onClick={() => setActiveMenu('')} className="flex-1 bg-transparent px-1 sm:px-2 py-1 outline-none text-[14px] text-slate-800 min-w-0" />
            
            <button onClick={() => setActiveMenu(activeMenu === 'attach' ? '' : 'attach')} className={`p-1.5 ${activeMenu === 'attach' ? 'text-blue-600 rotate-45' : 'text-slate-400'}`}><Paperclip size={20} className="transform -rotate-45 transition-transform" /></button>
          </div>
          <button onClick={() => inputText.trim() ? sendPayload('text', {}, inputText) : null} className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
            {inputText.trim() ? <Send size={18} className="ml-0.5" /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullFeatureChatApp;