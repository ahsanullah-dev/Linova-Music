import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, Send, Music2, Play, Pause, X, Image as ImageIcon, Lock,
  Loader2, Search, ChevronRight, ImagePlus, ListMusic
} from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { api } from '../../services/api.js';

// ─── Playable Song Card (AI suggestion) ───────────────────────────────────────
const ChatSongCard = ({ track, contextSuggestions }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayerStore();
  const isCurrent = currentTrack?.id === track.id;
  const handlePlay = (e) => {
    e.stopPropagation();
    isCurrent ? togglePlay() : playTrack(track, contextSuggestions || [track]);
  };
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-linova-primary/40 transition-all group max-w-sm mt-1.5">
      <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0">
        <img src={track.artwork} alt={track.title} referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80'; }} />
        <button onClick={handlePlay}
          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isCurrent && isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white ml-0.5" />}
        </button>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold truncate ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>{track.title}</p>
        <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
      </div>
      <button onClick={handlePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isCurrent && isPlaying ? 'bg-emerald-500 text-black' : 'bg-linova-primary/80 text-white hover:bg-linova-primary'}`}>
        {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>
    </div>
  );
};

// ─── Music Picker Modal ────────────────────────────────────────────────────────
const MusicPickerModal = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query, 'songs');
        setResults(res.tracks?.slice(0, 8) || []);
      } catch (e) { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-linova-primary" />
            <span className="font-extrabold text-sm text-white">Pick a Song</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-linova-primary/50 transition-colors">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search Linova catalog…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none" />
            {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto px-2 pb-3 space-y-0.5 scrollbar-none">
          {results.length === 0 && query.trim() && !loading && (
            <p className="text-center text-xs text-gray-500 py-6">No results for "{query}"</p>
          )}
          {!query.trim() && (
            <p className="text-center text-xs text-gray-500 py-6">Search for any song, artist, or album</p>
          )}
          {results.map(track => (
            <button key={track.id} onClick={() => onSelect(track)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group text-left">
              <img src={track.artwork} alt={track.title} referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&auto=format&fit=crop&q=80'; }} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{track.title}</p>
                <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-linova-primary transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Attach Menu Popup ─────────────────────────────────────────────────────────
const AttachMenu = ({ onPickSong, onPickImage, onClose }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (!menuRef.current?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={menuRef}
      className="absolute bottom-full left-0 mb-2 bg-[#1a1d2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 w-52">
      <button onClick={onPickSong}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group">
        <div className="w-8 h-8 rounded-xl bg-linova-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-linova-primary/30 transition-colors">
          <Music2 className="w-4 h-4 text-linova-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Attach Music</p>
          <p className="text-[10px] text-gray-400">Search from catalog</p>
        </div>
      </button>
      <div className="mx-3 border-t border-white/5" />
      <button onClick={onPickImage}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left group">
        <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/30 transition-colors">
          <ImagePlus className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Attach Image</p>
          <p className="text-[10px] text-gray-400">AI analyzes visuals</p>
        </div>
      </button>
    </div>
  );
};

// ─── Backend AI Call ────────────────────────────────────────────────────────────
async function callBackendAI(history, userMessage, attachedSong = null, attachedImage = null) {
  const messages = [
    ...history,
    {
      role: 'user',
      content:
        userMessage ||
        (attachedSong
          ? 'Tell me about this song and suggest similar ones.'
          : attachedImage
            ? 'Analyze this image and suggest music that matches its mood or vibe.'
            : '')
    }
  ];

  const data = await api.chatAI(messages, {
    attachedSong,
    attachedImage
  });

  return (data?.text ?? data) || "I couldn't generate a response right now.";
}

function parseSongSuggestions(text) {
  const suggestions = [];
  const regex = /<song_suggestion>\s*([\s\S]*?)\s*<\/song_suggestion>/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.title && parsed.artist) suggestions.push(parsed);
    } catch (e) {}
  }
  return suggestions;
}

function stripSongTags(text) {
  return text.replace(/<song_suggestion>[\s\S]*?<\/song_suggestion>/g, '').trim();
}

function renderMarkdown(text) {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-white font-extrabold">{part}</strong> : <span key={i}>{part}</span>
  );
}

// ─── Main Chat Page ─────────────────────────────────────────────────────────────
const WELCOME_MESSAGE = {
  id: 'init', role: 'assistant',
  content: "Hey! I'm **Linova AI** 🎵 — your personal music expert. Attach any song from the catalog or an image from your gallery and I'll analyze it and suggest similar vibes. Or just ask me anything about music!",
  songs: [], timestamp: Date.now()
};

export const AIChatPage = () => {
  const { currentTrack } = usePlayerStore();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const { openAuthModal } = useAppStore();

  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const [messages, setMessages] = useState([{
    id: 'init', role: 'assistant',
    content: "Hey! I'm **Linova AI** 🎵 — your personal music expert. Attach any song from the catalog or an image from your gallery and I'll analyze it and suggest similar vibes. Or just ask me anything about music!",
    songs: [], timestamp: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedSong, setAttachedSong] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null); // { dataUrl, base64, mimeType, name }
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsSearched, setSuggestionsSearched] = useState(new Set());
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  // Load persisted chat history. Messages live on the server per user, so the
  // conversation survives navigation, refreshes and new devices - it is only
  // ever removed when the user explicitly clears it.
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setIsHistoryLoading(false);
      return;
    }

    (async () => {
      setIsHistoryLoading(true);
      try {
        const stored = await api.getAiHistory();
        if (cancelled) return;

        if (Array.isArray(stored) && stored.length > 0) {
          const restored = stored.map((m) => ({
            id: m.clientId || m._id,
            role: m.role,
            content: m.content,
            songs: m.songs || [],
            attachedSong: m.attachedSong || null,
            timestamp: new Date(m.createdAt).getTime()
          }));
          setMessages([WELCOME_MESSAGE, ...restored]);

          // Re-resolve playable tracks for restored suggestions.
          restored.forEach((m) => (m.songs || []).forEach((s) => resolveTrack(s)));
        }
      } catch (e) {
        console.warn('[AI] Could not load chat history:', e);
      } finally {
        if (!cancelled) setIsHistoryLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const persistMessage = useCallback(async (msg) => {
    if (!isAuthenticated) return;
    try {
      await api.addAiMessage({
        role: msg.role,
        content: msg.content,
        songs: msg.songs || [],
        attachedSong: msg.attachedSong || null,
        hasImage: !!msg.attachedImage,
        clientId: msg.id
      });
    } catch (e) {
      console.warn('[AI] Could not persist message:', e);
    }
  }, [isAuthenticated]);

  // Resolve AI song suggestions → playable tracks
  const resolveTrack = useCallback(async (suggestion) => {
    const key = `${suggestion.artist}||${suggestion.title}`;
    if (suggestionsSearched.has(key)) return;
    setSuggestionsSearched(prev => new Set([...prev, key]));
    try {
      const res = await api.search(suggestion.query || `${suggestion.title} ${suggestion.artist}`, 'songs');
      const track = res.tracks?.[0];
      if (track) setSuggestions(prev => [...prev, { key, track }]);
    } catch (e) {}
  }, [suggestionsSearched]);

  // Image file picker handler
  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      setAttachedImage({ dataUrl, base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !attachedSong && !attachedImage) return;

    const userMsg = {
      id: Date.now().toString(), role: 'user',
      content: text,
      attachedSong: attachedSong || null,
      attachedImage: attachedImage ? { dataUrl: attachedImage.dataUrl, name: attachedImage.name } : null,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    persistMessage(userMsg);
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    const song = attachedSong;
    const image = attachedImage;

    setInput('');
    setAttachedSong(null);
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const aiText = await callBackendAI(history, text, song, image ? { base64: image.base64, mimeType: image.mimeType } : null);
      const songSuggestions = parseSongSuggestions(aiText);
      const cleanText = stripSongTags(aiText);

      const aiMsg = {
        id: `ai_${Date.now()}`, role: 'assistant',
        content: cleanText, songs: songSuggestions, timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      persistMessage(aiMsg);
      songSuggestions.forEach(s => resolveTrack(s));
    } catch (e) {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`, role: 'assistant',
        content: "I'm having a moment — please try again! 🎵",
        songs: [], timestamp: Date.now()
      }]);
    } finally { setIsLoading(false); }
  };

  const quickPrompts = [
    { label: '🎸 Best Bangla rock bands?', text: 'What are the best Bangla rock bands and their top songs?' },
    { label: '💔 Sad Bangla songs', text: 'Suggest some deeply emotional sad Bangla songs' },
    { label: '🌙 Late night chill mix', text: 'Give me a late night chill playlist mix' },
    { label: '🔥 Trending hits', text: 'What are some trending Bangla and Hindi hits right now?' }
  ];

  // Linova AI requires an account: chat history is stored per user, and the
  // backend rejects /api/ai/* without a valid token.
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col h-full bg-[#0c0e17] rounded-2xl overflow-hidden border border-white/5 items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl mb-5">
          <Bot className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">Sign in to chat with Linova AI</h2>
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          Your conversations are saved to your account, so you can pick up right where you
          left off. Create a free account or log in to get started.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-full bg-linova-primary text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span>Log in or sign up</span>
        </button>
      </div>
    );
  }

  if (isAuthLoading || isHistoryLoading) {
    return (
      <div className="flex flex-col h-full bg-[#0c0e17] rounded-2xl overflow-hidden border border-white/5 items-center justify-center">
        <Loader2 className="w-7 h-7 text-linova-primary animate-spin" />
        <p className="text-xs text-gray-500 mt-3">Loading your conversation…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0c0e17] rounded-2xl overflow-hidden border border-white/5 relative">
      {/* Hidden image file input */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      {/* Music Picker Modal */}
      {showMusicPicker && (
        <MusicPickerModal
          onSelect={(track) => { setAttachedSong(track); setShowMusicPicker(false); }}
          onClose={() => setShowMusicPicker(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-indigo-950/50 via-[#0c0e17] to-[#0c0e17] flex-shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-linova-primary via-linova-violet to-linova-cyan flex items-center justify-center shadow-glow-primary flex-shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black text-white">Linova AI</h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider">Music Expert</span>
          </div>
          <p className="text-[11px] text-gray-400">Attach songs or images • Ask anything about music</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Online</span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-none">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-md mt-1 ${msg.role === 'assistant' ? 'bg-gradient-to-tr from-linova-primary to-linova-violet' : 'bg-white/10 border border-white/20'}`}>
              {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <span className="text-[10px] font-black">U</span>}
            </div>

            <div className={`max-w-[78%] space-y-2 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {/* Attached song pill */}
              {msg.attachedSong && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-linova-primary/15 border border-linova-primary/30 text-xs font-bold text-linova-primary">
                  <Music2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <img src={msg.attachedSong.artwork} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" referrerPolicy="no-referrer"
                    onError={e => e.currentTarget.style.display = 'none'} />
                  <span className="truncate max-w-[140px]">{msg.attachedSong.title}</span>
                  <span className="text-linova-primary/60 font-normal">— {msg.attachedSong.artist}</span>
                </div>
              )}

              {/* Attached image */}
              {msg.attachedImage && (
                <div className="rounded-xl overflow-hidden border border-violet-500/30 max-w-[200px]">
                  <img src={msg.attachedImage.dataUrl} alt={msg.attachedImage.name}
                    className="w-full object-cover max-h-36" />
                  <div className="px-2 py-1 bg-violet-900/30 flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3 text-violet-400 flex-shrink-0" />
                    <span className="text-[10px] text-violet-300 truncate">{msg.attachedImage.name}</span>
                  </div>
                </div>
              )}

              {/* Text bubble */}
              {msg.content && (
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-linova-primary to-linova-violet text-white rounded-tr-sm'
                  : 'bg-white/5 border border-white/8 text-gray-100 rounded-tl-sm'}`}>
                  {renderMarkdown(msg.content)}
                </div>
              )}

              {/* Playable song cards from AI */}
              {msg.songs?.length > 0 && (
                <div className="space-y-1">
                  {msg.songs.map((s, i) => {
                    const key = `${s.artist}||${s.title}`;
                    const resolved = suggestions.find(sv => sv.key === key);
                    if (resolved) return <ChatSongCard key={i} track={resolved.track} contextSuggestions={suggestions.map(sv => sv.track)} />;
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 max-w-sm mt-1.5 animate-pulse">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0" />
                        <div className="space-y-1.5 flex-1"><div className="h-2.5 bg-white/10 rounded w-3/4" /><div className="h-2 bg-white/10 rounded w-1/2" /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-linova-primary to-linova-violet flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-linova-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-linova-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-linova-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => (
            <button key={i} onClick={() => { setInput(p.text); inputRef.current?.focus(); }}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-linova-primary/20 border border-white/10 hover:border-linova-primary/40 text-xs text-gray-300 hover:text-white transition-all">
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Area ── */}
      <div className="px-4 pb-4 pt-2 border-t border-white/5 flex-shrink-0 space-y-2">
        {/* Attachment previews */}
        {(attachedSong || attachedImage) && (
          <div className="flex flex-wrap gap-2">
            {attachedSong && (
              <div className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-xl bg-linova-primary/15 border border-linova-primary/30 max-w-[220px]">
                <img src={attachedSong.artwork} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-linova-primary truncate">{attachedSong.title}</p>
                  <p className="text-[10px] text-linova-primary/60 truncate">{attachedSong.artist}</p>
                </div>
                <button onClick={() => setAttachedSong(null)} className="text-gray-400 hover:text-rose-400 transition-colors p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {attachedImage && (
              <div className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-xl bg-violet-500/15 border border-violet-500/30 max-w-[180px]">
                <img src={attachedImage.dataUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-violet-300 truncate">{attachedImage.name}</p>
                  <p className="text-[10px] text-violet-400/60">Image · AI will analyze</p>
                </div>
                <button onClick={() => setAttachedImage(null)} className="text-gray-400 hover:text-rose-400 transition-colors p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          {/* Attach popup menu */}
          {showAttachMenu && (
            <AttachMenu
              onPickSong={() => { setShowAttachMenu(false); setShowMusicPicker(true); }}
              onPickImage={() => { setShowAttachMenu(false); imageInputRef.current?.click(); }}
              onClose={() => setShowAttachMenu(false)}
            />
          )}

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-linova-primary/50 transition-colors">
            {/* Attach button */}
            <button
              onClick={() => setShowAttachMenu(v => !v)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${showAttachMenu ? 'bg-linova-primary/30 text-linova-primary' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              title="Attach music or image"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask about music, moods, artists…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 resize-none focus:outline-none leading-relaxed max-h-24 overflow-y-auto scrollbar-none" />

            <button onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedSong && !attachedImage)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isLoading || (!input.trim() && !attachedSong && !attachedImage)
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-linova-primary to-linova-violet text-white hover:brightness-110 hover:scale-105 shadow-glow-primary'}`}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600">
          📎 Attach a song from the catalog or an image — AI analyzes both
        </p>
      </div>
    </div>
  );
};
