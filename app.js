// app.js — frontend logic (demo). Configure BACKEND constant to deployed backend URL or empty for same origin.
const BACKEND = ''; // ex: 'https://your-backend.up.railway.app'

/* --- UI routing --- */
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const s = btn.dataset.section;
    document.getElementById('breadcrumb').textContent = btn.textContent;
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById(s).classList.remove('hidden');
  });
});

/* --- XP / Progress sim --- */
let state = { xp:0, level:'A2' };
function updateXP() {
  const xp = state.xp;
  document.getElementById('xp').textContent = xp;
  const percent = Math.min(100, (xp/1000)*100);
  document.getElementById('xpBar').style.width = percent + '%';
  document.getElementById('xpText').textContent = xp + ' XP';
}
updateXP();

/* --- populate lessons --- */
const lessons = [
  {id:1,title:'Basics: Pronouns & verbs', xp:50},
  {id:2,title:'Present simple vs continuous', xp:80},
  {id:3,title:'Past tenses', xp:120},
  {id:4,title:'Modal verbs & requests', xp:100},
  {id:5,title:'Listening: short dialogs', xp:90}
];
const lessonList = document.getElementById('lessonList');
lessons.forEach(l=>{
  const el = document.createElement('div');
  el.className = 'card small';
  el.innerHTML = `<strong>${l.title}</strong><div class="muted">${l.xp} XP</div>`;
  el.addEventListener('click', ()=> startLesson(l));
  lessonList.appendChild(el);
});

/* --- lesson starter --- */
function startLesson(l){
  alert('Starting lesson: ' + l.title + ' (demo). Earn ' + l.xp + ' XP on completion.');
  state.xp += l.xp; updateXP();
}

/* --- Speaking: Web Speech API --- */
let recorder, recognition;
const sPrompt = document.getElementById('sPrompt');
sPrompt.textContent = 'Repeat: "I have been studying English for two years."';
const startRec = document.getElementById('startRec');
const stopRec = document.getElementById('stopRec');
const recResult = document.getElementById('recResult');
const sendAI = document.getElementById('sendAI');

if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  startRec.addEventListener('click', ()=>{
    recResult.textContent = 'Listening...';
    recognition.start();
    startRec.disabled = true; stopRec.disabled = false;
  });
  stopRec.addEventListener('click', ()=>{
    recognition.stop();
    startRec.disabled = false; stopRec.disabled = true;
  });
  recognition.onresult = (e)=>{
    const text = e.results[0][0].transcript;
    recResult.textContent = 'You said: ' + text;
    sendAI.disabled = false;
    // store last capture
    recognition.lastTranscript = text;
  };
  recognition.onerror = (e)=>{ recResult.textContent = 'Error: ' + e.error; startRec.disabled=false; stopRec.disabled=true; };
} else {
  startRec.disabled = true; stopRec.disabled = true; recResult.textContent = 'Speech recognition not supported in this browser.';
}

/* --- send speaking to AI backend --- */
sendAI.addEventListener('click', async ()=>{
  const text = recognition.lastTranscript || '';
  if(!text) return alert('No transcript available.');
  document.getElementById('aiSpeakingFeedback').textContent = 'Asking AI...';
  try{
    const r = await fetch((BACKEND||'') + '/api/ai/feedback', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ mode:'speaking', userText:text, prompt: sPrompt.textContent })
    });
    const j = await r.json();
    document.getElementById('aiSpeakingFeedback').innerHTML = `<strong>AI feedback:</strong><div>${j.feedback}</div>`;
    // award XP small
    state.xp += 20; updateXP();
  }catch(e){
    document.getElementById('aiSpeakingFeedback').textContent = 'AI unavailable. See console.';
    console.error(e);
  }
});

/* --- Writing --- */
document.getElementById('sendWriting').addEventListener('click', async ()=>{
  const txt = document.getElementById('writeInput').value.trim();
  if(!txt) return alert('Write something first.');
  document.getElementById('aiWritingFeedback').textContent = 'Checking with AI...';
  try{
    const r = await fetch((BACKEND||'') + '/api/ai/feedback', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ mode:'writing', userText:txt })
    });
    const j = await r.json();
    document.getElementById('aiWritingFeedback').innerHTML = `<strong>AI suggestions:</strong><div>${j.feedback}</div>`;
    state.xp += 30; updateXP();
  }catch(e){
    document.getElementById('aiWritingFeedback').textContent = 'AI unavailable.';
    console.error(e);
  }
});

/* --- Listening: demo audio --- */
const listenAudio = document.getElementById('listenAudio');
listenAudio.src = 'https://www.w3schools.com/html/horse.mp3'; // replace with real clips
document.getElementById('checkListen').addEventListener('click', async ()=>{
  const ans = document.getElementById('listenAnswer').value.trim();
  if(!ans) return alert('Type your answer.');
  // offline scoring: simple fuzzy match
  const model = 'A short demo transcription'; // don't rely
  const score = (ans.length / Math.max(1, model.length)) * 100;
  document.getElementById('listenFeedback').textContent = `Demo score: ${Math.round(Math.min(100,score))}% (demo scoring)`;
  state.xp += 10; updateXP();
});

/* --- small helpers --- */
document.getElementById('resetBtn').addEventListener('click', ()=> { if(confirm('Reset XP?')){ state.xp=0; updateXP(); }});
document.querySelectorAll('[data-action]').forEach(el=>{
  el.addEventListener('click', ()=> document.querySelector('[data-section="'+el.dataset.action.split('-')[1]+'"]') );
});

