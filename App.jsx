import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, Smile, Paperclip, Video, CheckCheck, 
  Image as ImageIcon, User, MapPin, CreditCard, 
  Mic, Camera, FileText, Headphones, BarChart2, 
  IndianRupee, Sparkles, LogOut, ShieldCheck, Sticker, PhoneMissed, X
} from 'lucide-react';

// IMPORTANT: Ensure this is your active Render Backend URL
const socket = io('https://final-chat-demo.onrender.com'); 

const FullFeatureChatApp = () => {
  const [username, setUsername] = useState(localStorage.getItem('chat_user') || '');
  const [isJoined, setIsJoined] = useState(!!localStorage.getItem('chat_user'));
  
  const [inputText, setInputText] = useState('');
  const [activeMenu, setActiveMenu] = useState(''); 
  // MAGIC FIX: Load messages from memory, or start empty if none exist
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chat_history');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // MAGIC FIX: Every time a message is sent or received, save it to memory
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);
  
  // NEW STATES FOR DEMO MAGIC
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showCameraMode, setShowCameraMode] = useState(false);
  
  const chatEndRef = useRef(null);
  const videoRef = useRef(null); // Reference for the webcam

  const quickEmojis = ['😀','😂','🥰','😎','😭','😡','👍','🙏','🚀','✅','🔥','💯'];
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

  // --- CAMERA LOGIC ---
  const openCamera = async () => {
    setActiveMenu('');
    setShowCameraMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied or unavailable.");
      setShowCameraMode(false);
    }
  };

  const closeCamera = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks() || [];
    tracks.forEach(track => track.stop());
    setShowCameraMode(false);
  };

  // ==========================================
  // SCREEN 1: LOGIN 
  // ==========================================
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <ShieldCheck size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Secure Messenger</h1>
          <p className="text-center text-slate-500 mb-6 text-sm">Enter your display name to connect</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              autoFocus
            />
            <button type="submit" disabled={!username.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
              Enter Hub
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: MAIN APP
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200 font-sans text-slate-800 sm:p-4 p-0 relative">
      
      {/* --- FAKE VIDEO CALL OVERLAY --- */}
      {showVideoCall && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 animate-pulse">G</div>
          <h2 className="text-2xl font-bold mb-1">Global Network</h2>
          <p className="text-slate-400 mb-12">Calling...</p>
          <div className="flex gap-6">
            <button onClick={() => setShowVideoCall(false)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"><PhoneMissed size={28}/></button>
          </div>
        </div>
      )}

      {/* --- REAL WEBCAM OVERLAY --- */}
      {showCameraMode && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-lg shadow-2xl mb-6"></video>
          <div className="flex gap-6">
            <button onClick={closeCamera} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"><X size={28} className="text-white"/></button>
            <button onClick={() => { closeCamera(); sendPayload('feature', {label: 'Photo Captured', icon: '📸'}); }} className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-lg"><Camera size={28} className="text-black"/></button>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl sm:h-[95vh] h-[100dvh] bg-slate-50 sm:rounded-2xl rounded-none shadow-2xl flex flex-col relative overflow-hidden border border-slate-300">
        
        {/* HEADER */}
        <div className="bg-white px-5 py-4 flex items-center justify-between z-30 border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md uppercase">{username.charAt(0)}</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Global Network</h1>
              <p className="text-sm text-blue-600 font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Online</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setShowVideoCall(true)} className="hover:text-blue-600 transition p-2 bg-slate-100 rounded-full"><Video size={20} /></button>
            <button 
              onClick={() => { 
                localStorage.removeItem('chat_user'); 
                localStorage.removeItem('chat_history'); // Clears the chat on logout
                window.location.reload(); 
              }} 
              className="hover:text-red-500 transition p-2 bg-slate-100 rounded-full" title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-6 pb-6 z-10" onClick={() => setActiveMenu('')}>
          <div className="flex justify-center mb-6">
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-sm">
              <ShieldCheck size={14} className="inline mr-1 mb-0.5 text-blue-500" /> End-to-End Encrypted
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-4 animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`relative px-4 py-2.5 max-w-[85%] sm:max-w-[65%] shadow-md ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                <div className={`text-xs font-bold mb-1 ${msg.sender === 'me' ? 'text-blue-200' : 'text-indigo-500'}`}>{msg.senderName}</div>

                {msg.type === 'text' && <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>}
                
                {msg.type === 'sticker' && <div className="-mx-2"><img src={msg.url} alt="Sticker" className="w-32 h-32 object-contain drop-shadow-xl" /></div>}

                {/* --- UPGRADED REALISTIC POLL UI --- */}
                {msg.type === 'poll' && (
                  <div className="w-64 mt-1">
                    <div className="flex items-center gap-2 font-bold mb-3"><BarChart2 size={18}/> Seminar Presentation Day</div>
                    <div className="space-y-2 mb-3">
                      <label className="flex items-center gap-2 text-sm p-2 bg-black/10 rounded cursor-pointer hover:bg-black/20 transition"><input type="radio" name={`poll-${msg.id}`} /> Tuesday</label>
                      <label className="flex items-center gap-2 text-sm p-2 bg-black/10 rounded cursor-pointer hover:bg-black/20 transition"><input type="radio" name={`poll-${msg.id}`} /> Wednesday</label>
                      <label className="flex items-center gap-2 text-sm p-2 bg-black/10 rounded cursor-pointer hover:bg-black/20 transition"><input type="radio" name={`poll-${msg.id}`} /> Thursday</label>
                    </div>
                    <button className={`w-full py-2 rounded-lg text-sm font-bold ${msg.sender === 'me' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Vote</button>
                  </div>
                )}

                {msg.type === 'payment' && (
                  <div className="w-56 mt-1">
                    <div className="flex items-center gap-2 mb-2"><div className="bg-white/20 p-1.5 rounded-full"><IndianRupee size={18} /></div><span className="font-bold text-lg">₹ 1,500</span></div>
                    <button className={`w-full py-2 rounded-lg text-sm font-bold ${msg.sender === 'me' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Pay Now</button>
                  </div>
                )}

                {msg.type === 'location' && (
                  <div className="w-56 mt-1">
                    <div className="h-28 bg-slate-200 rounded-lg overflow-hidden relative mb-2">
                      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center"><MapPin size={28} className="text-red-500 drop-shadow-md" /></div>
                    </div>
                    <div className="font-semibold text-sm">Live Location Shared</div>
                  </div>
                )}

                {msg.type === 'feature' && (
                  <div className="flex items-center gap-3 mt-1 bg-black/10 p-2 rounded-lg pr-8">
                    <div className="p-2 bg-white/20 rounded-full">{msg.icon}</div>
                    <span className="font-semibold text-sm">{msg.label}</span>
                  </div>
                )}

                <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] font-medium ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {msg.time} {msg.sender === 'me' && <CheckCheck size={14} />}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} className="h-2" />
        </div>

        {/* BOTTOM INPUT AREA */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 relative z-40">
          
          {activeMenu === 'emoji' && (
            <div className="absolute bottom-20 left-4 bg-white shadow-2xl border border-slate-200 rounded-2xl p-4 w-[280px] grid grid-cols-4 gap-4 animate-in slide-in-from-bottom-2 z-50">
              {quickEmojis.map(e => <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>)}
            </div>
          )}

          {activeMenu === 'sticker' && (
            <div className="absolute bottom-20 left-12 bg-white shadow-2xl border border-slate-200 rounded-2xl p-4 w-[320px] flex flex-wrap gap-3 animate-in slide-in-from-bottom-2 z-50">
              {dummyStickers.map((s, i) => <img key={i} src={s} alt="sticker" onClick={() => sendPayload('sticker', {url: s})} className="w-14 h-14 cursor-pointer hover:scale-110 transition-transform" />)}
            </div>
          )}

          {activeMenu === 'attach' && (
            <div className="absolute bottom-20 left-4 sm:left-24 bg-white shadow-2xl border border-slate-200 rounded-2xl p-5 w-[320px] animate-in slide-in-from-bottom-2 z-50">
              <div className="grid grid-cols-3 gap-y-5 gap-x-2">
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('feature', {label: 'Image_102.jpg', icon: '🖼️'})}><div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><ImageIcon size={22}/></div><span className="text-xs font-semibold text-slate-600">Gallery</span></div>
                
                {/* ACTUALLY OPENS WEBCAM NOW */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={openCamera}><div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600"><Camera size={22}/></div><span className="text-xs font-semibold text-slate-600">Camera</span></div>
                
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('location')}><div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><MapPin size={22}/></div><span className="text-xs font-semibold text-slate-600">Location</span></div>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('feature', {label: 'Contact Card sent', icon: '👤'})}><div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><User size={22}/></div><span className="text-xs font-semibold text-slate-600">Contact</span></div>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('feature', {label: 'Project_Final.pdf', icon: '📄'})}><div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><FileText size={22}/></div><span className="text-xs font-semibold text-slate-600">Document</span></div>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('feature', {label: 'Voice Note (0:15)', icon: '🎵'})}><div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Headphones size={22}/></div><span className="text-xs font-semibold text-slate-600">Audio</span></div>
                
                {/* NOW SENDS A REALISTIC POLL */}
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('poll')}><div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><BarChart2 size={22}/></div><span className="text-xs font-semibold text-slate-600">Poll</span></div>
                
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('payment')}><div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><IndianRupee size={22}/></div><span className="text-xs font-semibold text-slate-600">Payment</span></div>
                <div className="flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105 transition" onClick={() => sendPayload('feature', {label: 'AI Generating...', icon: '✨'})}><div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><Sparkles size={22}/></div><span className="text-xs font-semibold text-slate-600">AI Images</span></div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full flex items-center px-3 py-2 border border-slate-200 focus-within:border-blue-400 transition-colors">
              <button onClick={() => setActiveMenu(activeMenu === 'emoji' ? '' : 'emoji')} className={`p-2 transition-colors ${activeMenu === 'emoji' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><Smile size={22}/></button>
              <button onClick={() => setActiveMenu(activeMenu === 'sticker' ? '' : 'sticker')} className={`p-1.5 mr-2 transition-colors ${activeMenu === 'sticker' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}><Sticker size={20}/></button>
              <input type="text" placeholder="message" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyPress} onClick={() => setActiveMenu('')} className="flex-1 bg-transparent px-2 py-1 outline-none text-[15px] text-slate-800" />
              <button onClick={() => setActiveMenu(activeMenu === 'attach' ? '' : 'attach')} className={`p-2 transition-transform ${activeMenu === 'attach' ? 'text-blue-600 rotate-45' : 'text-slate-400 hover:text-blue-600'}`}><Paperclip size={22} className="transform -rotate-45" /></button>
            </div>
            <button onClick={() => inputText.trim() ? sendPayload('text', {}, inputText) : null} className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 flex-shrink-0 shadow-md transition-colors">
              {inputText.trim() ? <Send size={20} className="ml-0.5" /> : <Mic size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullFeatureChatApp;