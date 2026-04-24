import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, Smile, Paperclip, Video, CheckCheck, 
  Image as ImageIcon, User, Info, LogOut, MapPin, 
  CreditCard, Mic, Camera, FileText, Headphones, 
  BarChart2, IndianRupee, Sparkles, Sticker
} from 'lucide-react';

// IMPORTANT: Ensure this is your active Render Backend URL
const socket = io('https://final-chat-server-v2.onrender.com'); 

const FullFeatureChatApp = () => {
  // 1. LOCAL STORAGE: Remembers user on refresh
  const [username, setUsername] = useState(localStorage.getItem('chat_user') || '');
  const [isJoined, setIsJoined] = useState(!!localStorage.getItem('chat_user'));
  
  const [inputText, setInputText] = useState('');
  const [activeMenu, setActiveMenu] = useState(''); // 'attach', 'emoji', 'sticker', or ''
  const [messages, setMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null); 
  
  const chatEndRef = useRef(null);

  // Data for Interactive Menus
  const quickEmojis = ['😀','😂','🥰','😎','😭','😡','👍','🙏','🚀','✅','🔥','💯'];
  const dummyStickers = [
    'https://cdn-icons-png.flaticon.com/512/8065/8065529.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392524.png',
    'https://cdn-icons-png.flaticon.com/512/6188/6188688.png'
  ];

  // Socket Listener
  useEffect(() => {
    socket.on('receive_message', (data) => {
      const incomingMsg = { ...data, sender: 'them' };
      setMessages((prev) => [...prev, incomingMsg]);
    });
    return () => socket.off('receive_message');
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMenu, selectedMsgId]);

  // Handle Login
  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      localStorage.setItem('chat_user', username.trim());
      setIsJoined(true);
    }
  };

  // Central Payload Sender for All Features
  const sendPayload = (type, content = {}, text = '') => {
    const now = new Date();
    const newMsg = {
      id: Date.now(),
      text: text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      sender: 'me',
      senderName: username,
      type: type,
      ...content
    };
    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setInputText('');
    setActiveMenu(''); // Close menus after sending
  };

  // Keyboard Enter to Send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputText.trim()) sendPayload('text', {}, inputText);
  };

  // Toggle Time Details
  const handleMessageClick = (id) => {
    setSelectedMsgId(selectedMsgId === id ? null : id);
  };

  // ==========================================
  // SCREEN 1: LOGIN (Clean & Simple)
  // ==========================================
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5] font-sans">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 animate-in fade-in duration-500">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-normal text-center text-[#41525d] mb-6">Enter your name to join</h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <input 
              type="text" 
              placeholder="Your Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#00a884] text-[15px]"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!username.trim()}
              className="w-full bg-[#00a884] hover:bg-[#008f6f] disabled:bg-gray-300 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: MAIN APP (WhatsApp Style)
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#eae6df] font-sans text-[#111b21] sm:p-4 p-0 relative">
      <div className="w-full max-w-5xl sm:h-[95vh] h-[100dvh] bg-[#efeae2] sm:rounded-lg rounded-none shadow-xl flex flex-col relative overflow-hidden animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between z-30 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#74cbb5] rounded-full flex items-center justify-center text-white font-bold text-lg uppercase shadow-sm">
              {username.charAt(0)}
            </div>
            <div>
              <h1 className="text-base font-medium text-[#111b21]">Global Network</h1>
              <p className="text-xs text-[#00a884] font-medium">online</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[#54656f]">
            <button className="hover:text-gray-700 transition" onClick={() => alert("Video call connected!")}><Video size={24} /></button>
            <button 
              onClick={() => { localStorage.removeItem('chat_user'); window.location.reload(); }}
              className="hover:text-red-500 flex items-center gap-1 transition" title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* CHAT AREA */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-[8%] pt-4 pb-4 z-10" 
          onClick={() => setActiveMenu('')}
        >
          <div className="flex justify-center mb-6 mt-2">
            <span className="text-[12.5px] text-[#54656f] bg-[#ffeecd] px-3 py-1 rounded-lg shadow-sm font-medium">
              END-TO-END ENCRYPTED SESSION
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} mb-3 animate-in slide-in-from-bottom-2 duration-300`}>
              
              {/* Message Bubble Container */}
              <div 
                onClick={() => handleMessageClick(msg.id)}
                className={`relative px-2 py-1.5 max-w-[85%] sm:max-w-[65%] shadow-sm rounded-lg cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] ${
                  msg.sender === 'me' ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}
              >
                {/* Sender Name for received texts */}
                {msg.sender === 'them' && (
                  <div className="text-[12px] font-medium text-[#c031aa] mb-0.5 px-1">{msg.senderName}</div>
                )}

                {/* --- 1. TEXT BUBBLE --- */}
                {msg.type === 'text' && (
                  <div className="flex items-end gap-3 pb-0.5">
                    <span className="text-[14.2px] leading-5 whitespace-pre-wrap px-1">{msg.text}</span>
                    <div className="flex items-center gap-1 opacity-70 float-right mt-2 ml-2">
                      {msg.sender === 'me' && <CheckCheck size={15} className="text-[#53bdeb]" />}
                    </div>
                  </div>
                )}

                {/* --- 2. STICKER BUBBLE --- */}
                {msg.type === 'sticker' && (
                  <div className="p-1">
                    <img src={msg.url} alt="Sticker" className="w-28 h-28 object-contain drop-shadow-md" />
                  </div>
                )}

                {/* --- 3. PAYMENT BUBBLE --- */}
                {msg.type === 'payment' && (
                  <div className="w-64 p-1">
                    <div className="text-gray-500 text-sm mb-2 text-center mt-1 flex items-center justify-center gap-1">
                      <CreditCard size={16} /> Payment Request
                    </div>
                    <button className="w-full bg-[#1da06d] text-white py-2.5 rounded-md font-medium shadow-sm hover:bg-[#168559] transition">
                      Pay Now (₹ 1,500)
                    </button>
                    <div className="flex justify-end mt-1 opacity-70">
                      {msg.sender === 'me' && <CheckCheck size={15} className="text-[#53bdeb]" />}
                    </div>
                  </div>
                )}

                {/* --- 4. LOCATION BUBBLE --- */}
                {msg.type === 'location' && (
                  <div className="w-64 p-1">
                    <div className="h-32 bg-gray-200 rounded-md overflow-hidden relative mb-2">
                      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center"><MapPin size={32} className="text-red-500 drop-shadow-md" /></div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium px-1">
                      <span>Live Location</span>
                      {msg.sender === 'me' && <CheckCheck size={15} className="text-[#53bdeb] opacity-70" />}
                    </div>
                  </div>
                )}
              </div>

              {/* DATE & TIME CLICK DRAWER */}
              {selectedMsgId === msg.id && (
                <div className="mt-1 mb-1 text-[11px] font-medium text-gray-500 bg-white/70 backdrop-blur-sm border border-gray-200 px-2.5 py-1 rounded-md shadow-sm animate-in slide-in-from-top-1 duration-200">
                  <span className="flex items-center gap-1">
                    <Info size={12} className="text-blue-500" />
                    {msg.sender === 'me' ? 'Delivered' : 'Received'} on {msg.fullDate} at {msg.time}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} className="h-2" />
        </div>

        {/* BOTTOM INPUT AREA */}
        <div className="bg-[#f0f2f5] px-3 py-3 relative z-40">
          
          {/* INTERACTIVE POPUP MENUS */}
          <div className="relative w-full">
            
            {/* EMOJI MENU */}
            {activeMenu === 'emoji' && (
              <div className="absolute bottom-4 left-0 bg-white shadow-xl border border-gray-100 rounded-2xl p-4 w-[280px] grid grid-cols-4 gap-4 animate-in slide-in-from-bottom-2">
                {quickEmojis.map(e => (
                  <button key={e} onClick={() => setInputText(prev => prev + e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            )}

            {/* STICKER MENU */}
            {activeMenu === 'sticker' && (
              <div className="absolute bottom-4 left-10 bg-white shadow-xl border border-gray-100 rounded-2xl p-4 w-[280px] flex justify-between animate-in slide-in-from-bottom-2">
                {dummyStickers.map((s, i) => (
                  <img key={i} src={s} alt="sticker" onClick={() => sendPayload('sticker', {url: s})} className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform" />
                ))}
              </div>
            )}

            {/* 3x3 ATTACHMENT MENU (Matches your Image) */}
            {activeMenu === 'attach' && (
              <div className="absolute bottom-4 left-14 bg-white shadow-xl border border-gray-100 rounded-2xl p-6 w-[340px] animate-in slide-in-from-bottom-2">
                <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => sendPayload('sticker', {url: dummyStickers[0]})}>
                    <div className="w-14 h-14 rounded-full bg-[#bf59cf] flex items-center justify-center text-white"><ImageIcon size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Gallery</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-14 h-14 rounded-full bg-[#d3396d] flex items-center justify-center text-white"><Camera size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Camera</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => sendPayload('location')}>
                    <div className="w-14 h-14 rounded-full bg-[#00a884] flex items-center justify-center text-white"><MapPin size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Location</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-14 h-14 rounded-full bg-[#009de2] flex items-center justify-center text-white"><User size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Contact</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-14 h-14 rounded-full bg-[#5157ae] flex items-center justify-center text-white"><FileText size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Document</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-14 h-14 rounded-full bg-[#e95c0f] flex items-center justify-center text-white"><Headphones size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Audio</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-14 h-14 rounded-full bg-[#ffbc38] flex items-center justify-center text-white"><BarChart2 size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Poll</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => sendPayload('payment')}>
                    <div className="w-14 h-14 rounded-full bg-[#128c7e] flex items-center justify-center text-white"><IndianRupee size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80">
                    <div className="w-14 h-14 rounded-full bg-[#027eb5] flex items-center justify-center text-white"><Sparkles size={28}/></div>
                    <span className="text-[13px] text-[#54656f]">AI Images</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT BAR */}
          <div className="flex items-end gap-2 mt-1">
            <div className="flex-1 bg-white rounded-3xl flex items-center px-2 py-1.5 min-h-[44px] shadow-sm">
              <button onClick={() => setActiveMenu(activeMenu === 'emoji' ? '' : 'emoji')} className={`p-2 transition-colors ${activeMenu === 'emoji' ? 'text-[#00a884]' : 'text-[#54656f] hover:text-gray-700'}`}><Smile size={24}/></button>
              <button onClick={() => setActiveMenu(activeMenu === 'sticker' ? '' : 'sticker')} className={`p-1.5 mr-1 transition-colors ${activeMenu === 'sticker' ? 'text-[#00a884]' : 'text-[#54656f] hover:text-gray-700'}`}><Sticker size={22}/></button>
              
              <input 
                type="text" 
                placeholder="Message" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                onClick={() => setActiveMenu('')}
                className="flex-1 bg-transparent px-2 py-2 outline-none text-[15px]"
              />
              
              <button 
                onClick={() => setActiveMenu(activeMenu === 'attach' ? '' : 'attach')} 
                className={`p-2 transition-transform ${activeMenu === 'attach' ? 'text-[#00a884] rotate-45' : 'text-[#54656f] hover:text-gray-700'}`}
              >
                <Paperclip size={22} className="transform -rotate-45" />
              </button>
              <button className="p-2 text-[#54656f] hover:text-gray-700 hidden sm:block"><Camera size={22}/></button>
            </div>
            
            {/* MIC / SEND BUTTON */}
            <button 
              onClick={() => inputText.trim() ? sendPayload('text', {}, inputText) : null}
              className="w-[48px] h-[48px] bg-[#00a884] rounded-full flex items-center justify-center text-white hover:bg-[#008f6f] flex-shrink-0 shadow-md transition-all"
            >
              {inputText.trim() ? <Send size={20} className="ml-1" /> : <Mic size={22} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FullFeatureChatApp;