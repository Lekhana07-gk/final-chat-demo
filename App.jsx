import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, MapPin, Smile, Paperclip, Video, CheckCheck, Image as ImageIcon, User, Info, MoreVertical, Phone } from 'lucide-react';

const socket = io('https://chat-backend-final.onrender.com'); // Replace with your Render URL

const FullFeatureChatApp = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, { ...data, sender: 'them' }]);
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const newMsg = {
      id: Date.now(),
      text: inputText,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: now.toLocaleDateString(),
      sender: 'me',
      senderName: username,
      type: 'text'
    };
    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setInputText('');
  };

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <h1 className="text-2xl font-bold text-center mb-6">Enter Your Name</h1>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border mb-4"
            placeholder="Name..."
          />
          <button onClick={() => username.trim() && setIsJoined(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Join Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f0f2f5] p-0 sm:p-4">
      <div className="w-full max-w-4xl h-[100vh] sm:h-[90vh] bg-white sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* ATTRACTIVE HEADER */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-30 border-b shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl uppercase">
              {username.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Global Network</h1>
              <p className="text-xs font-medium text-green-500">Online • {username}</p>
            </div>
          </div>
          <div className="flex gap-2 text-slate-400">
            <Phone size={20} className="cursor-pointer hover:text-blue-600" />
            <Video size={20} className="cursor-pointer hover:text-blue-600" />
            <MoreVertical size={20} className="cursor-pointer hover:text-slate-600" />
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#f8fafc]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div 
                onClick={() => setSelectedMsgId(selectedMsgId === msg.id ? null : msg.id)}
                className={`px-4 py-2.5 max-w-[75%] shadow-sm rounded-2xl cursor-pointer transition-transform hover:scale-[1.01] ${
                  msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-700 rounded-tl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="flex justify-end gap-1 mt-1 opacity-70">
                  <span className="text-[10px]">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCheck size={12} />}
                </div>
              </div>
              {selectedMsgId === msg.id && (
                <div className="text-[10px] text-slate-400 mt-1 px-2 italic">
                  Sent on {msg.fullDate}
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* FLOATING INPUT */}
        <div className="p-4 bg-white border-t sm:bg-transparent sm:border-none sm:absolute sm:bottom-0 sm:left-0 sm:right-0">
          <div className="max-w-3xl mx-auto bg-white border rounded-full flex items-center p-1.5 shadow-lg focus-within:ring-2 ring-blue-100">
            <button className="p-2 text-slate-400 hover:text-blue-500"><Smile size={20}/></button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Type a message..." 
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
            />
            <button 
              onClick={handleSendText}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition ${inputText.trim() ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FullFeatureChatApp;