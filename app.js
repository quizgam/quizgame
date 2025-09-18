const BACKEND = "https://englishlearn-ai-app.onrender.com"; // 🔗 Remplace par ton URL Render
let targetLang = "en";

/* --- Switcher Langue --- */
document.getElementById("langSelect").addEventListener("change", (e) => {
  targetLang = e.target.value;
});

/* --- Speaking (Web Speech API) --- */
let recognition;
const recResult = document.getElementById("recResult");
const sendAI = document.getElementById("sendAI");

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  document.getElementById("startRec").addEventListener("click", () => {
    recognition.start();
    recResult.textContent = "🎙️ Listening...";
  });

  document.getElementById("stopRec").addEventListener("click", () => {
    recognition.stop();
  });

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    recResult.textContent = `You said: "${text}"`;
    recResult.dataset.text = text;
    sendAI.disabled = false;
  };
} else {
  recResult.textContent = "❌ Speech recognition not supported.";
}

/* --- Send to AI (Speaking & Writing) --- */
async function askAI(mode, text) {
  const res = await fetch(BACKEND + "/api/ai/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, userText: text, targetLang })
  });
  return res.json();
}

sendAI.addEventListener("click", async () => {
  const text = recResult.dataset.text;
  const data = await askAI("speaking", text);
  document.getElementById("aiSpeakingFeedback").textContent = data.feedback;
});

document.getElementById("sendWriting").addEventListener("click", async () => {
  const text = document.getElementById("writeInput").value;
  const data = await askAI("writing", text);
  document.getElementById("aiWritingFeedback").textContent = data.feedback;
});

/* --- Listening avec Audio IA --- */
document.getElementById("playAI").addEventListener("click", async () => {
  const sentence =
    targetLang === "fr"
      ? "Je parle français couramment."
      : targetLang === "de"
      ? "Ich lerne gerade Deutsch."
      : "I am learning English quickly.";

  const res = await fetch(BACKEND + "/api/ai/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sentence, lang: targetLang })
  });

  if (!res.ok) {
    alert("Erreur génération audio");
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();

  // stocker phrase attendue pour vérification
  document.getElementById("playAI").dataset.expected = sentence.toLowerCase();
});

document.getElementById("checkListen").addEventListener("click", () => {
  const ans = document.getElementById("listenAnswer").value.trim().toLowerCase();
  const expected = document.getElementById("playAI").dataset.expected || "";
  document.getElementById("listenFeedback").textContent =
    ans === expected ? "✅ Perfect!" : `❌ Expected: "${expected}"`;
});
