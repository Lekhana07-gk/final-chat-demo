import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, Smile, Paperclip, Video, CheckCheck, Check,
  Image as ImageIcon, User, MapPin, IndianRupee, 
  Mic, Camera, FileText, Headphones, BarChart2, 
  Sparkles, LogOut, ShieldCheck, Sticker, PhoneMissed, X 
} from 'lucide-react';

const socket = io('https://final-chat-demo.onrender.com'); 

const FullFeatureChatApp = () => {
  const [username, setUsername] = useState(localStorage.getItem('chat_user') || '');
  const [statusText, setStatusText] = useState(localStorage.getItem('chat_status') || 'Available 🚀');
  const [avatar, setAvatar] = useState(localStorage.getItem('chat_avatar') || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix');
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
  const fileInputRef = useRef(null);

  const quickEmojis = ['😀','😂','🥰','😎','😭','😡','👍','🙏','🚀','✅','🔥','💯'];
  
  // Pre-loaded Demo Profile Pictures
  const avatarOptions = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo'
  ];

  const dummyStickers = [
    'https://cdn-icons-png.flaticon.com/512/8065/8065529.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392524.png',
    'https://cdn-icons-png.flaticon.com/512/6188/6188688.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392464.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392461.png',
    'https://cdn-icons-png.flaticon.com/512/4140/4140048.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140047.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140039.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140051.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140040.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140055.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140042.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140038.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140034.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140060.png', 
    'https://cdn-icons-png.flaticon.com/512/4140/4140052.png'  
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
      localStorage.setItem('chat_status', statusText.trim());
      localStorage.setItem('chat_avatar', avatar);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("For this live demo, please select a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      const isImage = file.type.startsWith('image/');
      
      sendPayload(isImage ? 'image' : 'document', {
        fileUrl: base64Data,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB'
      });
    };
    reader.readAsDataURL(file);
    setActiveMenu(''); 
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
      <div className="flex items-center justify-center h-[100dvh] w-full max-w-full overflow-hidden bg-slate-950 font-sans px-4 box-border">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-slate-800">
          
          {/* LOGO SECTION */}
          <div className="flex justify-center mb-6">
            <img src="/logo192.png" alt="App Logo" className="w-24 h-24 object-contain drop-shadow-2xl hover:scale-105 transition-transform" />
          </div>
          
          <h1 className="text-2xl font-bold text-center text-white mb-2">Nexus Chat</h1>
          <p className="text-center text-slate-400 mb-6 text-sm">Set up your profile to connect</p>
          
          <form onSubmit={handleJoin} className="space-y-4 w-full">
            
            {/* AVATAR SELECTOR */}
            <div className="flex justify-center gap-4 py-2 mb-2">
              {avatarOptions.map((imgUrl, i) => (
                <img 
                  key={i} 
                  src={imgUrl} 
                  alt="Avatar option" 
                  onClick={() => setAvatar(imgUrl)} 
                  className={`w-12 h-12 rounded-full cursor-pointer transition-all bg-slate-800 ${avatar === imgUrl ? 'ring-2 ring-cyan-500 scale-110 shadow-lg shadow-cyan-500/40' : 'opacity-60 hover:opacity-100'}`} 
                />
              ))}
            </div>

            <input type="text" placeholder="Your Display Name" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-800 text-white placeholder-slate-500 box-border" autoFocus />
            <input type="text" placeholder="Your Status (e.g., At college)" value={statusText} onChange={(e) => setStatusText(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-800 text-white placeholder-slate-500 box-border" />
            
            <button type="submit" disabled={!username.trim()} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all shadow-md box-border">Enter Hub</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full overflow-hidden bg-slate-950 font-sans text-slate-200 relative box-border">
      
      {showVideoCall && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center text-white w-full h-full overflow-hidden">
          <img src={avatar} alt="Profile" className="w-24 h-24 rounded-full mb-4 animate-pulse shadow-lg shadow-cyan-500/50 bg-slate-800 border-2 border-slate-700" />
          <h2 className="text-2xl font-bold mb-1">{username}</h2>
          <p className="text-slate-400 mb-12">Calling...</p>
          <button onClick={() => setShowVideoCall(false)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 shadow-lg shadow-red-500/30 transition-all"><PhoneMissed size={28}/></button>
        </div>
      )}

      {showCameraMode && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 w-full h-full overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-2xl shadow-2xl mb-6 max-h-[60vh] border border-slate-800"></video>
          <div className="flex gap-6">
            <button onClick={closeCamera} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><X size={28} className="text-white"/></button>
            <button onClick={() => { closeCamera(); sendPayload('feature', {label: 'Photo Captured', icon: '📸'}); }} className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/20"><Camera size={28} className="text-black"/></button>
          </div>
        </div>
      )}

      {/* UPDATED CHAT HEADER WITH CUSTOM PROFILE */}
      <div className="bg-slate-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between z-30 border-b border-slate-800 shadow-sm w-full max-w-full shrink-0 box-border">
        <div className="flex items-center gap-3 min-w-0">
          <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full shadow-md shrink-0 border border-slate-700 bg-slate-800" />
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-base font-bold text-white truncate leading-tight">{username}</h1>
            {isOnline ? (
              <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span> <span className="truncate">Online • {statusText}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0"></span> <span className="truncate">Last seen at {lastActiveTime}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <button onClick={() => setShowVideoCall(true)} className="p-2.5 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-cyan-400 text-slate-300 shrink-0 transition-colors"><Video size={18} /></button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-2.5 bg-slate-800 rounded-full hover:bg-slate-700 hover:text-red-400 text-slate-300 shrink-0 transition-colors"><LogOut size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 pt-4 pb-4 w-full max-w-full box-border [&::-webkit-scrollbar]:hidden" onClick={() => setActiveMenu('')}>
        <div className="flex justify-center mb-6 w-full">
          <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            <ShieldCheck size={12} className="inline mr-1 mb-0.5 text-cyan-500" /> End-to-End Encrypted
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-4 w-full box-border`}>
            <div className={`relative px-4 py-2.5 max-w-[95%] sm:max-w-[75%] shadow-md box-border overflow-hidden ${msg.sender === 'me' ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-cyan-900/20' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm'}`}>
              <div className={`text-[11px] font-bold mb-1 truncate ${msg.sender === 'me' ? 'text-cyan-100' : 'text-cyan-400'}`}>{msg.senderName}</div>

              {msg.type === 'text' && <div className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>}
              {msg.type === 'sticker' && <div className="-mx-1"><img src={msg.url} alt="Sticker" className="w-24 h-24 object-contain drop-shadow-xl max-w-full" /></div>}
              
              {msg.type === 'image' && (
                <div className="mt-1 -mx-1">
                  <img src={msg.fileUrl} alt={msg.fileName} className="w-48 sm:w-64 max-h-64 rounded-xl object-cover drop-shadow-md border border-white/10" />
                </div>
              )}

              {msg.type === 'document' && (
                <div className="mt-1 w-full min-w-[160px] bg-black/20 p-2.5 rounded-lg border border-white/10 flex items-center gap-3 hover:bg-black/30 transition cursor-pointer">
                  <div className="bg-white/20 p-2 rounded-lg shrink-0"><FileText size={20} className={msg.sender === 'me' ? 'text-white' : 'text-cyan-400'}/></div>
                  <div className="overflow-hidden flex-1">
                    <div className="font-semibold text-[13px] truncate">{msg.fileName}</div>
                    <div className="text-[10px] opacity-70 uppercase">{msg.fileSize} • FILE</div>
                  </div>
                </div>
              )}

              {msg.type === 'audio' && (
                <div className="mt-1 w-[240px] shrink-0 overflow-hidden rounded-[20px] bg-slate-100">
                  <audio controls src={msg.audioUrl} className="h-10 w-[240px] shrink-0" />
                </div>
              )}

              {msg.type === 'poll' && (
                <div className="w-full min-w-[180px] max-w-full mt-1">
                  <div className="flex items-center gap-1.5 font-bold text-sm mb-2 truncate"><BarChart2 size={16} className="shrink-0 text-cyan-300"/> Day</div>
                  <div className="space-y-1.5 mb-2 w-full">
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/20 rounded cursor-pointer w-full overflow-hidden truncate"><input type="radio" name={`poll-${msg.id}`} className="shrink-0" /> Tuesday</label>
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/20 rounded cursor-pointer w-full overflow-hidden truncate"><input type="radio" name={`poll-${msg.id}`} className="shrink-0" /> Wednesday</label>
                    <label className="flex items-center gap-2 text-[13px] p-1.5 bg-black/20 rounded cursor-pointer w-full overflow-hidden truncate"><input type="radio" name={`poll-${msg.id}`} className="shrink-0" /> Thursday</label>
                  </div>
                  <button onClick={(e) => { alert("Vote recorded!"); e.target.innerText = "Voted ✓"; e.target.disabled = true; e.target.classList.add("opacity-50"); }} className={`w-full py-1.5 rounded-md text-sm font-bold truncate transition-colors ${msg.sender === 'me' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>Vote</button>
                </div>
              )}

              {msg.type === 'payment' && (
                <div className="w-full min-w-[160px] max-w-full mt-1">
                  <div className="flex items-center gap-2 mb-2"><div className="bg-white/20 p-1.5 rounded-full shrink-0"><IndianRupee size={14} /></div><span className="font-bold truncate text-lg">₹ 1,500</span></div>
                  <button className={`w-full py-1.5 rounded-md text-sm font-bold truncate transition-colors ${msg.sender === 'me' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>Pay</button>
                </div>
              )}

              {msg.type === 'location' && (
                <div className="w-full min-w-[160px] max-w-full mt-1">
                  <div className="h-24 bg-slate-700 rounded-md overflow-hidden relative mb-1.5 w-full border border-slate-600">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center"><MapPin size={24} className="text-red-500 drop-shadow-lg" /></div>
                  </div>
                  <div className="font-semibold text-[13px] truncate">Live Location</div>
                </div>
              )}

              {msg.type === 'feature' && (
                <div className="flex items-center gap-2 mt-1 bg-black/20 p-1.5 rounded-md pr-3 w-full max-w-full overflow-hidden border border-white/5">
                  <div className="p-1.5 bg-white/20 rounded-full shrink-0">{msg.icon}</div>
                  <span className="font-semibold text-[13px] truncate">{msg.label}</span>
                </div>
              )}

              <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-medium shrink-0 ${msg.sender === 'me' ? 'text-cyan-100' : 'text-slate-400'}`}>
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

      <div className="bg-slate-950 p-3 relative w-full max-w-full shrink-0 box-border border-t border-slate-800">
        
        {activeMenu === 'emoji' && (
          <div className="absolute bottom-20 left-4 bg-slate-800/95 backdrop-blur-md shadow-2xl border border-slate-700 rounded-2xl p-4 w-[calc(100%-32px)] max-w-[260px] grid grid-cols-4 gap-3 z-50 box-border">
            {quickEmojis.map(e => <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-2xl hover:scale-110 transition-transform shrink-0">{e}</button>)}
          </div>
        )}

        {activeMenu === 'sticker' && (
          <div className="absolute bottom-20 left-4 bg-slate-800/95 backdrop-blur-md shadow-2xl border border-slate-700 rounded-2xl p-4 w-[calc(100%-32px)] max-w-[300px] h-[250px] overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-wrap gap-3 z-50 box-border content-start">
            {dummyStickers.map((s, i) => <img key={i} src={s} alt="sticker" onClick={() => sendPayload('sticker', {url: s})} className="w-14 h-14 cursor-pointer hover:scale-110 transition-transform shrink-0 drop-shadow-lg" />)}
          </div>
        )}

        {activeMenu === 'attach' && (
          <div className="absolute bottom-20 left-4 bg-slate-800/95 backdrop-blur-md shadow-2xl border border-slate-700 rounded-2xl p-5 w-[calc(100%-32px)] max-w-[320px] z-50 box-border overflow-hidden">
            <div className="grid grid-cols-3 gap-y-6 gap-x-2">
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-purple-400 shrink-0 shadow-inner"><ImageIcon size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Gallery</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={openCamera}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-pink-400 shrink-0 shadow-inner"><Camera size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Camera</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => sendPayload('location')}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner"><MapPin size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Location</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => sendPayload('feature', {label: 'Contact', icon: '👤'})}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-blue-400 shrink-0 shadow-inner"><User size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Contact</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner"><FileText size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Document</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => sendPayload('poll')}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-yellow-400 shrink-0 shadow-inner"><BarChart2 size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Poll</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => sendPayload('payment')}>
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-teal-400 shrink-0 shadow-inner"><IndianRupee size={20}/></div>
                <span className="text-[11px] font-semibold text-slate-300 truncate w-full text-center">Payment</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700 shadow-inner w-full min-w-0 max-w-2xl mx-auto">
          <button onClick={() => setActiveMenu(activeMenu === 'emoji' ? '' : 'emoji')} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"><Smile size={20}/></button>
          <button onClick={() => setActiveMenu(activeMenu === 'sticker' ? '' : 'sticker')} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"><Sticker size={20}/></button>
          <button onClick={() => setActiveMenu(activeMenu === 'attach' ? '' : 'attach')} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"><Paperclip size={20}/></button>
          
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message..." 
            className="flex-1 min-w-[40px] w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none px-2 py-2"
          />

          {inputText.trim() ? (
            <button 
              onClick={() => sendPayload('text', {}, inputText)} 
              className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full transition-colors shadow-md shadow-cyan-500/30 shrink-0"
            >
              <Send size={18}/>
            </button>
          ) : (
            <button 
              onMouseDown={startRecording} 
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-2.5 rounded-full text-white transition-all shadow-md shrink-0 ${isRecording ? 'bg-red-500 animate-pulse shadow-red-500/50' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              <Mic size={18}/>
            </button>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload} 
        accept="image/*, application/pdf, .doc, .docx, .txt" 
      />

    </div>
  );
};

export default FullFeatureChatApp;