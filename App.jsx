import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MapPin, CreditCard, Smile, Paperclip, Video, Phone, CheckCheck, Image as ImageIcon } from 'lucide-react';

// Connect to your local server
const socket = io('https://final-chat-demo.onrender.com');

const FullFeatureChatApp = () => {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(''); 
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  const quickEmojis = ['😀','😂','🥰','😎','😭','😡','👍','🙏','🚀','✅'];
  const dummyStickers = [
    'https://cdn-icons-png.flaticon.com/512/8065/8065529.png',
    'https://cdn-icons-png.flaticon.com/512/4392/4392524.png',
    'https://cdn-icons-png.flaticon.com/512/6188/6188688.png'
  ];

  // 1. REAL-TIME CONNECTION
  useEffect(() => {
    socket.on('receive_message', (data) => {
      const incomingMsg = { ...data, sender: 'them' };
      setMessages((prev) => [...prev, incomingMsg]);
    });
    return () => socket.off('receive_message');
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showMenu]);

  // 2. SENDING REAL TEXT
  const handleSendText = () => {
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
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

  // 3. SENDING PRO FEATURES
  const sendPayload = (type, content = {}) => {
    const newMsg = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      type: type,
      ...content
    };
    
    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setShowMenu('');
  };

  return (
  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', width: '100vw' }}>
      
      {/* The rest of your chat app code stays exactly the same inside here */}

  </div>
);
      
      {/* Formal Desktop Frame */}
      <div className="w-full max-w-2xl h-[90vh] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Neutral generic avatar instead of a specific person */}
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm">
                #
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              {/* Changed to neutral generic names */}
              <h1 className="text-lg font-bold text-slate-900">Live Chat Session</h1>
              <p className="text-sm font-medium text-emerald-600">Connected User</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full cursor-pointer hover:bg-blue-100 transition font-semibold text-sm shadow-sm" onClick={() => alert("Simulating Video Call Connection...")}>
              <Video size={18} /> Video Call
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-full cursor-pointer hover:bg-slate-100 transition shadow-sm">
              <Phone size={18} />
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-[160px] space-y-6 bg-[#f8fafc] z-10" onClick={() => setShowMenu('')}>
          
          <div className="flex justify-center mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-100">Sync Active</span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              
              {/* TEXT MESSAGE */}
              {msg.type === 'text' && (
                <div className={`px-5 py-3 max-w-[75%] shadow-sm ${msg.sender === 'me' ? 'bg-[#0084ff] text-white rounded-2xl rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm'}`}>
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  <div className="flex justify-end items-center gap-1 mt-1 -mb-1 opacity-80">
                    <span className="text-[10px] font-medium">{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck size={14} className="text-blue-200" />}
                  </div>
                </div>
              )}

              {/* PERFECTLY SIZED STICKER */}
              {msg.type === 'sticker' && (
                <div className="bg-transparent p-1">
                  <img src={msg.url} alt="Sticker" className="w-28 h-28 object-contain drop-shadow-xl hover:scale-105 transition-transform" />
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                  </div>
                </div>
              )}

              {/* LOCATION CARD */}
              {msg.type === 'location' && (
                <div className={`p-2 max-w-[75%] w-72 shadow-md ${msg.sender === 'me' ? 'bg-[#0084ff] rounded-2xl rounded-br-sm' : 'bg-white border border-slate-200 rounded-2xl rounded-bl-sm'}`}>
                  <div className="h-32 bg-slate-200 rounded-xl overflow-hidden relative">
                     <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80" alt="Map" className="absolute inset-0 w-full h-full object-cover" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <MapPin size={24} className="text-blue-500" />
                        </div>
                     </div>
                  </div>
                  <div className={`px-3 py-2 flex justify-between items-center ${msg.sender === 'me' ? 'text-white' : 'text-slate-800'}`}>
                    <div>
                      <p className="text-sm font-bold">Live Location Shared</p>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT CARD */}
              {msg.type === 'payment' && (
                <div className={`p-5 max-w-[75%] w-72 shadow-md ${msg.sender === 'me' ? 'bg-white border border-slate-200 rounded-2xl rounded-br-sm' : 'bg-white border border-slate-200 rounded-2xl rounded-bl-sm'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-emerald-100 p-2 rounded-full"><CreditCard size={20} className="text-emerald-600" /></div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Payment Request</p>
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">₹1,500.00</h3>
                  <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition shadow-sm">
                    Pay Securely
                  </button>
                  <div className="flex justify-end mt-3"><span className="text-[10px] text-slate-400">{msg.time}</span></div>
                </div>
              )}

            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* SPACIOUS POPUP MENUS */}
        {showMenu === 'emoji' && (
          <div className="absolute bottom-[140px] left-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl z-50 w-[300px] animate-in slide-in-from-bottom-2">
            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Quick Emojis</p>
            <div className="grid grid-cols-5 gap-4">
              {quickEmojis.map((emoji, idx) => (
                <span key={idx} onClick={() => setInputText(prev => prev + emoji)} className="text-3xl cursor-pointer hover:scale-125 transition-transform text-center flex items-center justify-center">{emoji}</span>
              ))}
            </div>
          </div>
        )}

        {showMenu === 'sticker' && (
          <div className="absolute bottom-[140px] left-4 md:left-16 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl z-50 w-[320px] animate-in slide-in-from-bottom-2">
             <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Select a Sticker</p>
             <div className="grid grid-cols-3 gap-4">
                {dummyStickers.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition border border-slate-100 flex items-center justify-center cursor-pointer group"
                    onClick={() => sendPayload('sticker', { url })}
                  >
                    <img src={url} alt="Sticker" className="w-16 h-16 object-contain group-hover:scale-110 transition-transform drop-shadow-sm" />
                  </div>
                ))}
             </div>
          </div>
        )}

        {showMenu === 'attach' && (
          <div className="absolute bottom-[140px] left-4 md:left-24 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-50 w-[260px] animate-in slide-in-from-bottom-2">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Attachments</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition border border-transparent hover:border-slate-100" onClick={() => sendPayload('location')}>
                <div className="bg-emerald-100 p-2.5 rounded-lg"><MapPin size={20} className="text-emerald-600" /></div>
                <span className="text-sm font-bold text-slate-700">Share Location</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition border border-transparent hover:border-slate-100" onClick={() => sendPayload('payment')}>
                <div className="bg-blue-100 p-2.5 rounded-lg"><CreditCard size={20} className="text-blue-600" /></div>
                <span className="text-sm font-bold text-slate-700">Request Payment</span>
              </div>
            </div>
          </div>
        )}

        {/* EXPLICIT FEATURE INPUT BAR */}
        <div className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-slate-200 z-40 shadow-[0_-4px_20px_rgb(0,0,0,0.03)]">
          <div className="flex items-center gap-3 mb-4">
             <button onClick={() => setShowMenu(showMenu === 'emoji' ? '' : 'emoji')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${showMenu === 'emoji' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Smile size={18}/> Emojis</button>
             <button onClick={() => setShowMenu(showMenu === 'sticker' ? '' : 'sticker')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${showMenu === 'sticker' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><ImageIcon size={18}/> Stickers</button>
             <button onClick={() => setShowMenu(showMenu === 'attach' ? '' : 'attach')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition ${showMenu === 'attach' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Paperclip size={18}/> Location & Pay</button>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-full flex items-center p-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input 
              type="text" 
              placeholder="Type your message here..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              onClick={() => setShowMenu('')}
              className="flex-1 bg-transparent text-slate-800 px-4 outline-none text-[15px] font-medium"
            />
            <button 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-sm ml-1 ${inputText.length > 0 ? 'bg-[#0084ff] hover:bg-blue-600 text-white cursor-pointer hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-default'}`}
              onClick={inputText.length > 0 ? handleSendText : null}
            >
              <Send size={18} className={inputText.length > 0 ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FullFeatureChatApp;