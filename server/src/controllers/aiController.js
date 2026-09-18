import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are Linova AI, an expert music companion embedded in the Linova Music streaming platform. You have encyclopedic knowledge of:

BANGLA MUSIC: Artcell, Warfaze, Aurthohin, Shironamhin, Nemesis, Meghdol, AvoidRafa, Chirkutt, Cryptic Fate, Arbovirus, LRB, Miles, Nagar Baul, James, Ayub Bachchu, Wishtree, Aftermath, Black, Level Five, Bay of Bengal, Shunno, Lalon, Fakir Lalon Shah, Habib Wahid, Bappa Mazumder, Fuad, Minar, Imran, Tahsan, Siam, G-Series, Soundtek.

HINDI/BOLLYWOOD: Arijit Singh, Atif Aslam, Pritam, Shreya Ghoshal, KK, AR Rahman, Sonu Nigam, Kishore Kumar, Lata Mangeshkar, Mohammed Rafi, Gulzar, Vishal-Shekhar, Shankar-Ehsaan-Loy, Amit Trivedi.

GLOBAL/ENGLISH: Coldplay, Linkin Park, The Weeknd, Ed Sheeran, Taylor Swift, Radiohead, Arctic Monkeys, Metallica, Queen, Imagine Dragons, Billie Eilish, Harry Styles, Post Malone, Drake, Kendrick Lamar, Eminem, Pink Floyd, Led Zeppelin, The Beatles.

Your capabilities:
- Explain song meanings, themes, and lyrical context
- Give artist biographies and career timelines
- Recommend songs based on mood (sad, happy, energetic, romantic, late-night, workout, etc.)
- Compare artists and albums
- Identify genres, subgenres, and musical movements
- Discuss music production, chord progressions, vocal styles
- Suggest songs similar to what users share with you

CRITICAL RULE — When you suggest songs, ALWAYS embed them as structured JSON inside <song_suggestion> XML tags:
<song_suggestion>
{"title": "EXACT_SONG_TITLE", "artist": "EXACT_ARTIST_NAME", "query": "best search query to find this song"}
</song_suggestion>

You can include 1-5 song suggestions per response. Never list a song suggestion as plain text — always use the XML tag format so the user can play it directly.

Keep responses concise (3-6 sentences), warm, and music-focused. Never mention YouTube, ytmusic, or any external service names. Do not reveal you are built on Gemini or any Google product — you are simply "Linova AI".`;

// Always read key fresh from process.env (no caching — works with nodemon restarts)
const getGenAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') return null;
  return new GoogleGenerativeAI(key.trim());
};


// --- Offline smart fallback engine ---
function generateFallbackResponse(userMessage, attachedSong) {
  const msg = userMessage.toLowerCase();

  if (attachedSong) {
    const suggestions = getFallbackSuggestions(attachedSong.artist, attachedSong.title);
    return `Great pick sharing **${attachedSong.title}** by **${attachedSong.artist}**! 🎵 Based on its vibe, here are some tracks I think you'll love:

${suggestions.map(s => `<song_suggestion>\n{"title": "${s.title}", "artist": "${s.artist}", "query": "${s.query}"}\n</song_suggestion>`).join('\n\n')}`;
  }

  if (/(artcell|warfaze|aurthohin|shironamhin|nemesis|bangla rock|bangladeshi rock)/.test(msg)) {
    return `Bangla rock is one of the most emotionally charged music scenes in South Asia! 🎸 Here are essential tracks:

<song_suggestion>
{"title": "Oniket Prantor", "artist": "Artcell", "query": "Oniket Prantor Artcell"}
</song_suggestion>

<song_suggestion>
{"title": "Shei Tumi", "artist": "Aurthohin", "query": "Shei Tumi Aurthohin"}
</song_suggestion>

<song_suggestion>
{"title": "Bahana", "artist": "Warfaze", "query": "Bahana Warfaze"}
</song_suggestion>

<song_suggestion>
{"title": "Prank", "artist": "Nemesis", "query": "Prank Nemesis Bangladesh"}
</song_suggestion>`;
  }

  if (/(sad|heartbreak|heartbroken|cry|crying|emotional|miss you|missing|breakup)/.test(msg)) {
    return `When the heart aches, music understands 💔 Here are some deeply emotional tracks to feel it all:

<song_suggestion>
{"title": "Tum Hi Ho", "artist": "Arijit Singh", "query": "Tum Hi Ho Arijit Singh Aashiqui 2"}
</song_suggestion>

<song_suggestion>
{"title": "Fix You", "artist": "Coldplay", "query": "Fix You Coldplay X&Y"}
</song_suggestion>

<song_suggestion>
{"title": "Oniket Prantor", "artist": "Artcell", "query": "Oniket Prantor Artcell"}
</song_suggestion>

<song_suggestion>
{"title": "Tera Hona", "artist": "Atif Aslam", "query": "Tera Hona Atif Aslam"}
</song_suggestion>`;
  }

  if (/(happy|upbeat|energetic|pump|party|dance|fun|hype)/.test(msg)) {
    return `Let's turn up the energy! 🔥 Here are some absolute bangers:

<song_suggestion>
{"title": "Blinding Lights", "artist": "The Weeknd", "query": "Blinding Lights The Weeknd"}
</song_suggestion>

<song_suggestion>
{"title": "Believer", "artist": "Imagine Dragons", "query": "Believer Imagine Dragons"}
</song_suggestion>

<song_suggestion>
{"title": "Amar Sonar Bangla", "artist": "Various Artists", "query": "Bangladesh patriotic songs"}
</song_suggestion>`;
  }

  if (/(chill|relax|calm|sleep|lo.?fi|soft|mellow|night|late night|peaceful)/.test(msg)) {
    return `Perfect for winding down 🌙 Here's a late-night chill set:

<song_suggestion>
{"title": "The Scientist", "artist": "Coldplay", "query": "The Scientist Coldplay A Rush of Blood to the Head"}
</song_suggestion>

<song_suggestion>
{"title": "Chords of Life", "artist": "Artcell", "query": "Chords of Life Artcell"}
</song_suggestion>

<song_suggestion>
{"title": "Tere Bin", "artist": "Atif Aslam", "query": "Tere Bin Atif Aslam"}
</song_suggestion>`;
  }

  if (/(arijit|atif|bollywood|hindi|kumar sanu|kishore|sonu nigam)/.test(msg)) {
    return `Bollywood and Hindi playback are unmatched in emotional depth! 🎶 Here are some iconic tracks:

<song_suggestion>
{"title": "Tum Hi Ho", "artist": "Arijit Singh", "query": "Tum Hi Ho Arijit Singh"}
</song_suggestion>

<song_suggestion>
{"title": "Kun Faya Kun", "artist": "AR Rahman", "query": "Kun Faya Kun AR Rahman Rockstar"}
</song_suggestion>

<song_suggestion>
{"title": "Kesariya", "artist": "Arijit Singh", "query": "Kesariya Arijit Singh Brahmastra"}
</song_suggestion>`;
  }

  if (/(coldplay|linkin park|ed sheeran|weeknd|english|western)/.test(msg)) {
    return `Global hits that need no introduction 🌍 Here's a handpicked selection:

<song_suggestion>
{"title": "Yellow", "artist": "Coldplay", "query": "Yellow Coldplay Parachute"}
</song_suggestion>

<song_suggestion>
{"title": "Numb", "artist": "Linkin Park", "query": "Numb Linkin Park Meteora"}
</song_suggestion>

<song_suggestion>
{"title": "Shape of You", "artist": "Ed Sheeran", "query": "Shape of You Ed Sheeran"}
</song_suggestion>`;
  }

  if (/(recommend|suggest|play|what should|give me|find me|discover)/.test(msg)) {
    return `Here's a cross-genre handpicked mix I think you'll love 🎵

<song_suggestion>
{"title": "Oniket Prantor", "artist": "Artcell", "query": "Oniket Prantor Artcell"}
</song_suggestion>

<song_suggestion>
{"title": "Tum Hi Ho", "artist": "Arijit Singh", "query": "Tum Hi Ho Arijit Singh"}
</song_suggestion>

<song_suggestion>
{"title": "The Scientist", "artist": "Coldplay", "query": "The Scientist Coldplay"}
</song_suggestion>

<song_suggestion>
{"title": "Blinding Lights", "artist": "The Weeknd", "query": "Blinding Lights The Weeknd"}
</song_suggestion>`;
  }

  return `I'm **Linova AI** — your personal music expert! 🎵 Ask me about song meanings, artist histories, or mood-based recommendations. You can also share a song from the player using the 📎 button and I'll find you similar tracks to vibe with!`;
}

function getFallbackSuggestions(artist, title) {
  const a = artist.toLowerCase();
  const t = title.toLowerCase();

  if (/(artcell|warfaze|aurthohin|shironamhin|nemesis|cryptic fate|arbovirus)/.test(a)) {
    return [
      { title: 'Shei Tumi', artist: 'Aurthohin', query: 'Shei Tumi Aurthohin' },
      { title: 'Bahana', artist: 'Warfaze', query: 'Bahana Warfaze' },
      { title: 'Prank', artist: 'Nemesis', query: 'Prank Nemesis Bangladesh' },
      { title: 'Chords of Life', artist: 'Artcell', query: 'Chords of Life Artcell' }
    ];
  }
  if (/(arijit|atif|shreya|pritam|ar rahman|sonu)/.test(a)) {
    return [
      { title: 'Tum Hi Ho', artist: 'Arijit Singh', query: 'Tum Hi Ho Arijit Singh' },
      { title: 'Kun Faya Kun', artist: 'AR Rahman', query: 'Kun Faya Kun AR Rahman' },
      { title: 'Kesariya', artist: 'Arijit Singh', query: 'Kesariya Arijit Singh' }
    ];
  }
  if (/(coldplay|linkin park|radiohead|ed sheeran|weeknd|imagine dragons)/.test(a)) {
    return [
      { title: 'The Scientist', artist: 'Coldplay', query: 'The Scientist Coldplay' },
      { title: 'Numb', artist: 'Linkin Park', query: 'Numb Linkin Park' },
      { title: 'Blinding Lights', artist: 'The Weeknd', query: 'Blinding Lights The Weeknd' }
    ];
  }

  // Generic cross-genre mix
  return [
    { title: 'Oniket Prantor', artist: 'Artcell', query: 'Oniket Prantor Artcell' },
    { title: 'Tum Hi Ho', artist: 'Arijit Singh', query: 'Tum Hi Ho Arijit Singh' },
    { title: 'Yellow', artist: 'Coldplay', query: 'Yellow Coldplay' }
  ];
}

// Retry with exponential backoff for 503 overload.
//
// Previously this list was ['gemini-3.6-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'].
// As of 2026, Gemini 1.5 and the entire 2.0 Flash line (including 2.0-flash-lite) have
// been permanently shut down and return an immediate 404 - so on any hiccup with the
// first model, every request burned two guaranteed-dead fallback attempts (each with
// its own retry-with-backoff loop) before finally giving up. That was the source of
// both symptoms: normal replies took long stretches to fail over, and a transient 503
// on the first model made the whole request fail outright far more often than it should.
//
// 'gemini-flash-latest' is Google's auto-updating alias to their current best Flash
// model, so this list self-heals as Google rotates models without needing a redeploy.
const MODEL_PRIORITY = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
const REQUEST_TIMEOUT_MS = 12_000; // per attempt - bounds total worst-case latency
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callWithRetry(ai, systemInstruction, history, parts) {
  let lastErr;
  for (const modelName of MODEL_PRIORITY) {
    // Only the primary model gets a retry on a transient error - it's the one
    // most likely to be temporarily overloaded. Fallbacks get one shot each so
    // a bad run can't compound into a minute-plus wait.
    const retries = modelName === MODEL_PRIORITY[0] ? 1 : 0;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model = ai.getGenerativeModel(
          {
            model: modelName,
            systemInstruction,
            generationConfig: { temperature: 0.9, maxOutputTokens: 900 }
          },
          { timeout: REQUEST_TIMEOUT_MS }
        );
        let result;
        const hasImage = parts.some(p => p.inlineData);
        if (hasImage && history.length === 0) {
          result = await model.generateContent(parts);
        } else {
          const chat = model.startChat({ history });
          result = await chat.sendMessage(parts);
        }
        return { text: result.response.text(), model: modelName };
      } catch (err) {
        lastErr = err;
        const is503 = err.status === 503 || err.message?.includes('503') || err.message?.includes('high demand');
        const is404 = err.status === 404 || err.message?.includes('404') || err.message?.includes('no longer available');
        const isTimeout = err.name === 'AbortError' || err.message?.includes('timeout') || err.message?.includes('aborted');
        if (is404) break; // this model is gone from Google's side, move to the next one immediately
        if ((is503 || isTimeout) && attempt < retries) {
          await sleep(1000 * (attempt + 1)); // 1s, then give up on this model
          continue;
        }
        break; // any other error (or retries exhausted): try the next model rather than throw immediately
      }
    }
  }
  throw lastErr || new Error('All Gemini models unavailable');
}

// Main controller
export const chatAI = async (req, res) => {
  try {
    const { messages = [], attachedSong = null, attachedImage = null } = req.body;

    const userMessage = messages[messages.length - 1]?.content || '';
    const ai = getGenAI();

    if (!ai) {
      const text = generateFallbackResponse(userMessage, attachedSong);
      return res.json({ data: { text, model: 'linova-local' } });
    }

    // Build strictly alternating history — Gemini requires it always starts with 'user'
    const historyMessages = messages.slice(0, -1).slice(-10);
    const history = [];
    for (const m of historyMessages) {
      // Skip the static init assistant welcome (it has id='init')
      if (!m.content || m.content.includes("Hey! I'm **Linova AI**")) continue;
      const role = m.role === 'assistant' ? 'model' : 'user';
      if (history.length > 0 && history[history.length - 1].role === role) continue;
      history.push({ role, parts: [{ text: m.content }] });
    }
    // Final safety: strip leading model messages
    while (history.length > 0 && history[0].role === 'model') history.shift();

    // ── Build multimodal message parts ──
    const parts = [];
    if (attachedSong) {
      parts.push({ text: `[User shared a song: "${attachedSong.title}" by ${attachedSong.artist}${attachedSong.album ? ` from album "${attachedSong.album}"` : ''}]\n` });
    }
    if (attachedImage?.base64 && attachedImage?.mimeType) {
      parts.push({ inlineData: { mimeType: attachedImage.mimeType, data: attachedImage.base64 } });
      if (!userMessage.trim() && !attachedSong) {
        parts.push({ text: 'Analyze this image and suggest music that perfectly matches its mood, color palette, atmosphere, or scene.' });
      }
    }
    const finalText = userMessage.trim() ||
      (attachedSong && !attachedImage ? 'Tell me about this song in detail and suggest 3-4 similar tracks I can play.' : '') ||
      (attachedImage && !attachedSong ? "Suggest music that matches this image's vibe and atmosphere." : '') ||
      (attachedSong && attachedImage ? 'Analyze the image and this song together — find music that fits both moods.' : '');
    if (finalText) parts.push({ text: finalText });

    // Auto-retry across models on 503/404
    const { text, model: usedModel } = await callWithRetry(ai, SYSTEM_INSTRUCTION, history, parts);
    return res.json({ data: { text, model: usedModel } });

  } catch (err) {
    console.error('[AI Chat Error] Message:', err.message);
    console.error('[AI Chat Error] Status:', err.status ?? err.statusCode ?? 'N/A');
    const { messages = [], attachedSong = null } = req.body;
    const userMessage = messages[messages.length - 1]?.content || '';
    const text = generateFallbackResponse(userMessage, attachedSong);
    return res.json({ data: { text, model: 'linova-local' } });
  }
};
