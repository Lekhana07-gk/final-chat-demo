import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, Smile, Paperclip, Video, CheckCheck, Check,
  Image as ImageIcon, User, MapPin, IndianRupee, 
  Mic, Camera, FileText, Headphones, BarChart2, 
  Sparkles, LogOut, ShieldCheck, Sticker, PhoneMissed, X 
} from 'lucide-react';

// IMPORTANT: Your working Render URL
const socket = io('https://final-chat-demo.onrender.com'); 

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
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastActiveTime, setLastActiveTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
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
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setLastActiveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    socket.on('connect', handleOnline);
    socket.on('disconnect', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      socket.off('connect', handleOnline);
      socket.off('disconnect', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleReceive = (data) => {
      const incomingMsg = { ...data, sender: 'them' };
      setMessages((prev) => [...prev, incomingMsg]);
      setLastActiveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
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
    const msgId = Date.now();
    const newMsg = {
      id: msgId,
      text: text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      senderName: username,
      type: type,
      status: 'sent', 
      ...content
    };
    
    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setInputText('');
    setActiveMenu('');

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'delivered' } : m));
    }, 800);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'read' } : m));
    }, 2500); 
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

  const startRecording = async () => {
    setActiveMenu('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { audioBitsPerSecond: 16000 });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => sendPayload('audio', { audioUrl: reader.result });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center h-[100dvh] w-full max-w-full overflow-hidden bg-slate-100 font-sans px-4 box-border">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <ShieldCheck size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Secure Messenger</h1>
          <p className="text-center text-slate-500 mb-6 text-sm">Enter your display name to connect</p>
          <form onSubmit={handleJoin} className="space-y-4 w-full">
            <input type="text" placeholder="Your Name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 box-border" autoFocus />
            <button type="submit" disabled={!username.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors shadow-md box-border">Enter Hub</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full overflow-hidden bg-slate-50 font-sans text-slate-800 relative box-border">
      
      {showVideoCall && (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white w-full h-full overflow-hidden">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4 animate-pulse">G</div>
          <h2 className="text-2xl font-bold mb-1">Global Network</h2>
          <p className="text-slate-400 mb-12">Calling...</p>
          <button onClick={() => setShowVideoCall(false)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"><PhoneMissed size={28}/></button>
        </div>
      )}

      {showCameraMode && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 w-full h-full overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-lg shadow-2xl mb-6 max-h-[60vh]"></video>
          <div className="flex gap-6">
            <button onClick={closeCamera} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><X size={28} className="text-white"/></button>
            <button onClick={() => { closeCamera(); sendPayload('feature', {label: 'Photo Captured', icon: '📸'}); }} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg"><Camera size={28} className="text-black"/></button>
          </div>
        </div>
      )}

      <div className="bg-white px-3 py-3 flex items-center justify-between z-30 border-b border-slate-200 shadow-sm w-full max-w-full shrink-0 box-border">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md uppercase shrink-0">{username.charAt(0)}</div>
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-base font-bold text-slate-800 truncate leading-tight">Global Network</h1>
            {isOnline ? (
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"></span> <span className="truncate">Online</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span> <span className="truncate">Last seen at {lastActiveTime}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={() => setShowVideoCall(true)} className="p-2 bg-slate-100 rounded-full hover:text-blue-600 shrink-0"><Video size={18} /></button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-2 bg-slate-100 rounded-full hover:text-red-500 shrink-0"><LogOut size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 pt-4 pb-4 w-full max-w-full box-border" onClick={() => setActiveMenu('')}>
        <div className="flex justify-center mb-6 w-full">
          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            <ShieldCheck size={12} className="inline mr-1 mb-0.5 text-blue-500" /> End-to-End Encrypted
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-4 w-full box-border`}>
            <div className={`relative px-3 py-2 max-w-[95%] sm:max-w-[75%] shadow-md box-border overflow-hidden ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
              <div className={`text-[11px] font-bold mb-1 truncate ${msg.sender === 'me' ? 'text-blue-200' : 'text-indigo-500'}`}>{msg.senderName}</div>

              {msg.type === 'text' && <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>}
              {msg.type === 'sticker' && <div className="-mx-1"><img src={msg.url} alt="Sticker" className="w-24 h-24 object-contain drop-shadow-md max-w-full" /></div>}
              
              {/* THE FIXED AUDIO PLAYER */}
              {msg.type === 'audio' && (
                <div className="mt-2 mb-1 w-[220px] bg-white rounded-full overflow-hidden p-0.5 shadow-sm">
                  <audio controls controlsList="nodownload" src={msg.audioUrl} className="h-10 w-full" style={{ outline: 'none' }} />
                </div>
              )}

              {msg.type === 'poll' && (
                <div className="w-full min-w-[180px] max-w-full mt-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm mb-2 truncate"><BarChart2 size={16} className="shrink-0"/> Day</div>
                  <div className="space-y-1.5 mb-2 w-full">
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/5 rounded cursor-pointer w-full overflow-hidden truncate"><input type="radio" name={`poll-${msg.id}`} className="shrink-0" /> Tuesday</label>
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/5 rounded cursor-pointer w-full overflow-hidden truncate"><input type="radio" name={`poll-${msg.id}`} className="shrink-0" /> Wednesday</label>
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/5 rounded cursor-pointer w-full overflow-hidden truncate"><input type="radio" name={`poll-${msg.id}`} className="shrink-0" /> Thursday</label>
                  </div>
                  <button onClick={(e) => { alert("Vote recorded!"); e.target.innerText = "Voted ✓"; e.target.disabled = true; e.target.classList.add("opacity-50"); }} className={`w-full py-1.5 rounded-md text-sm font-bold truncate ${msg.sender === 'me' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Vote</button>
                </div>
              )}

              {msg.type === 'payment' && (
                <div className="w-full min-w-[160px] max-w-full mt-1">
                  <div className="flex items-center gap-2 mb-2"><div className="bg-white/20 p-1 rounded-full shrink-0"><IndianRupee size={14} /></div><span className="font-bold truncate">₹ 1,500</span></div>
                  <button className={`w-full py-1.5 rounded-md text-sm font-bold truncate ${msg.sender === 'me' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>Pay</button>
                </div>
              )}

              {msg.type === 'location' && (
                <div className="w-full min-w-[160px] max-w-full mt-1">
                  <div className="h-24 bg-slate-200 rounded-md overflow-hidden relative mb-1.5 w-full">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center"><MapPin size={24} className="text-red-500 drop-shadow-md" /></div>
                  </div>
                  <div className="font-semibold text-[13px] truncate">Live Location</div>
                </div>
              )}

              {msg.type === 'feature' && (
                <div className="flex items-center gap-2 mt-1 bg-black/10 p-1.5 rounded-md pr-2 w-full max-w-full overflow-hidden">
                  <div className="p-1.5 bg-white/20 rounded-full shrink-0">{msg.icon}</div>
                  <span className="font-semibold text-[13px] truncate">{msg.label}</span>
                </div>
              )}

              <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-medium shrink-0 ${msg.sender === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.time}
                
                {msg.sender === 'me' && (
                  <span className="ml-1 flex">
                    {msg.status === 'sent' && <Check size={14} className="text-white/70" />}
                    {msg.status === 'delivered' && <CheckCheck size={14} className="text-white/70" />}
                    {msg.status === 'read' && <CheckCheck size={14} className="text-cyan-300 drop-shadow-sm" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} className="h-2 w-full" />
      </div>

      <div className="bg-white border-t border-slate-200 p-2 relative w-full max-w-full shrink-0 box-border">
        {activeMenu === 'emoji' && (
          <div className="absolute bottom-16 left-2 bg-white shadow-xl border border-slate-200 rounded-xl p-3 w-[calc(100%-16px)] max-w-[260px] grid grid-cols-4 gap-3 z-50 box-border">
            {quickEmojis.map(e => <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-xl shrink-0">{e}</button>)}
          </div>
        )}

        {activeMenu === 'sticker' && (
          <div className="absolute bottom-16 left-2 bg-white shadow-xl border border-slate-200 rounded-xl p-3 w-[calc(100%-16px)] max-w-[300px] flex flex-wrap gap-2 z-50 box-border">
            {dummyStickers.map((s, i) => <img key={i} src={s} alt="sticker" onClick={() => sendPayload('sticker', {url: s})} className="w-12 h-12 cursor-pointer shrink-0" />)}
          </div>
        )}

        {activeMenu === 'attach' && (
          <div className="absolute bottom-16 left-2 bg-white shadow-xl border border-slate-200 rounded-xl p-3 w-[calc(100%-16px)] max-w-[300px] z-50 box-border overflow-hidden">
            <div className="grid grid-cols-3 gap-y-4 gap-x-2">
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('feature', {label: 'Image.jpg', icon: '🖼️'})}><div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0"><ImageIcon size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Gallery</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={openCamera}><div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 shrink-0"><Camera size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Camera</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('location')}><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><MapPin size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Location</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('feature', {label: 'Contact', icon: '👤'})}><div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><User size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Contact</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('feature', {label: 'Doc.pdf', icon: '📄'})}><div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><FileText size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Doc</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('poll')}><div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0"><BarChart2 size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Poll</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('payment')}><div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0"><IndianRupee size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">Payment</span></div>
              <div className="flex flex-col items-center gap-1 cursor-pointer overflow-hidden" onClick={() => sendPayload('feature', {label: 'AI Image', icon: '✨'})}><div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0"><Sparkles size={18}/></div><span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">AI</span></div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 w-full max-w-full overflow-hidden box-border">
          {isRecording ? (
            <div className="flex-1 bg-red-50 rounded-full flex items-center justify-between px-4 py-1.5 border border-red-200 min-w-0 overflow-hidden box-border animate-pulse">
               <span className="text-red-500 font-bold text-sm flex items-center gap-2 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Recording Audio...
               </span>
               <button onClick={stopRecording} className="text-red-600 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm shrink-0">Cancel</button>
            </div>
          ) : (
            <div className="flex-1 bg-slate-100 rounded-full flex items-center px-1 py-1 border border-slate-200 min-w-0 overflow-hidden box-border">
              <button onClick={() => setActiveMenu(activeMenu === 'emoji' ? '' : 'emoji')} className={`p-1.5 shrink-0 ${activeMenu === 'emoji' ? 'text-blue-600' : 'text-slate-400'}`}><Smile size={18}/></button>
              <button onClick={() => setActiveMenu(activeMenu === 'sticker' ? '' : 'sticker')} className={`p-1 shrink-0 ${activeMenu === 'sticker' ? 'text-blue-600' : 'text-slate-400'}`}><Sticker size={16}/></button>
              <input type="text" placeholder="Message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyPress} onClick={() => setActiveMenu('')} className="flex-1 min-w-0 w-full bg-transparent px-1 py-1 outline-none text-[14px] text-slate-800" />
              <button onClick={() => setActiveMenu(activeMenu === 'attach' ? '' : 'attach')} className={`p-1.5 shrink-0 ${activeMenu === 'attach' ? 'text-blue-600 rotate-45' : 'text-slate-400'}`}><Paperclip size={18} className="transform -rotate-45" /></button>
            </div>
          )}

          <button onClick={() => { isRecording ? stopRecording() : (inputText.trim() ? sendPayload('text', {}, inputText) : startRecording()); }} className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-md transition-colors ${isRecording ? 'bg-red-500' : 'bg-blue-600'}`}>
            {isRecording ? <Send size={16} className="ml-0.5" /> : (inputText.trim() ? <Send size={16} className="ml-0.5" /> : <Mic size={18} />)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullFeatureChatApp;