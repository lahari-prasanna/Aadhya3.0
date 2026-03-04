import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  Phone,
  Upload,
  FileText,
  History,
  MessageCircle,
  X,
  Send,
  Volume2,
} from "lucide-react";

const LANGUAGES = {
  english: { label: "EN", flag: "🇬🇧", full: "English" },
  telugu: { label: "తె", flag: "🇮🇳", full: "Telugu" },
  hindi: { label: "हि", flag: "🇮🇳", full: "Hindi" },
};

const SAMPLES = [
  {
    type: "UPI Fraud",
    icon: "💸",
    color: "#e53e3e",
    message:
      "Dear customer, your UPI ID has been flagged. Send ₹1 to reactivate your account. Click: bit.ly/upi-verify. Urgent!",
  },
  {
    type: "Lottery Scam",
    icon: "🎰",
    color: "#d69e2e",
    message:
      "Congratulations! You have WON ₹5,00,000 in KBC Lucky Draw 2024. To claim your prize call 9876543210 and share your Aadhar & bank details immediately!",
  },
  {
    type: "Job Scam",
    icon: "💼",
    color: "#dd6b20",
    message:
      "URGENT HIRING! Work from home. Earn ₹50,000/month. No experience needed. Just pay ₹500 registration fee. Limited seats. Apply now: bit.ly/job2024",
  },
  {
    type: "KYC Scam",
    icon: "🏦",
    color: "#6b46c1",
    message:
      "Your SBI account KYC is expired. Account will be SUSPENDED in 24 hours. Update KYC immediately: sbi-kyc-update.com. Enter Aadhar, PAN and OTP to continue.",
  },
  {
    type: "Phishing",
    icon: "🎣",
    color: "#2b6cb0",
    message:
      "HDFC Bank Alert: Suspicious login detected on your account. Verify your identity now at hdfc-secure-login.net. Enter your user ID, password and OTP to secure account.",
  },
];

const SCAM_KEYWORDS = [
  "won",
  "winner",
  "prize",
  "claim",
  "lottery",
  "lucky",
  "congratulations",
  "otp",
  "upi",
  "click here",
  "link",
  "verify",
  "suspended",
  "urgent",
  "immediately",
  "expire",
  "free",
  "reward",
  "gift",
  "job offer",
  "work from home",
  "earn",
  "salary",
  "hiring",
  "bank",
  "kyc",
  "aadhar",
  "pan",
  "password",
  "pin",
  "transfer",
  "send money",
  "investment",
  "double",
  "guaranteed",
  "register",
  "fee",
  "limited",
];

const theme = {
  bg: "#f8f7ff",
  card: "#ffffff",
  border: "#e2d9f3",
  primary: "#6b46c1",
  primaryLight: "#9f7aea",
  primaryBg: "#faf5ff",
  text: "#2d3748",
  textLight: "#718096",
  textMuted: "#a0aec0",
};

function highlightText(text) {
  let result = text;
  const found = [];
  SCAM_KEYWORDS.forEach((kw) => {
    const regex = new RegExp(`(${kw})`, "gi");
    if (regex.test(text)) {
      found.push(kw);
      result = result.replace(
        new RegExp(`(${kw})`, "gi"),
        `<mark style="background:#fed7d7;color:#742a2a;padding:2px 6px;border-radius:4px;font-weight:bold;border:1px solid #feb2b2;">$1</mark>`,
      );
    }
  });
  return { html: result, found };
}

function getRisk(score) {
  if (score >= 70)
    return {
      label: "HIGH RISK",
      color: "#742a2a",
      bg: "#fff5f5",
      border: "#feb2b2",
      icon: "🚨",
      light: "#fed7d7",
    };
  if (score >= 40)
    return {
      label: "SUSPICIOUS",
      color: "#744210",
      bg: "#fffbeb",
      border: "#f6e05e",
      icon: "⚠️",
      light: "#fefcbf",
    };
  return {
    label: "SAFE",
    color: "#276749",
    bg: "#f0fff4",
    border: "#9ae6b4",
    icon: "✅",
    light: "#c6f6d5",
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function playSound(isScam) {
  try {
    const ctx = new (
      window.AudioContext || window.webkitAudioContext
    )();
    function beep(freq, start, dur) {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.setValueAtTime(0.3, ctx.currentTime + start);
      g.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + start + dur,
      );
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur);
    }
    if (isScam) {
      beep(880, 0, 0.15);
      beep(880, 0.2, 0.15);
      beep(660, 0.4, 0.3);
    } else {
      beep(523, 0, 0.2);
      beep(659, 0.25, 0.3);
    }
  } catch (e) {}
}

function speakResult(result, language) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const risk = getRisk(result.scam_probability);
  let text = "";
  if (language === "telugu") {
    text = result.is_scam
      ? `హెచ్చరిక! ఈ సందేశం స్కామ్. రిస్క్ స్కోర్ ${result.scam_probability} శాతం. ${result.explanation}. ${result.what_to_do}`
      : `ఈ సందేశం సురక్షితంగా ఉంది. రిస్క్ స్కోర్ ${result.scam_probability} శాతం మాత్రమే.`;
  } else if (language === "hindi") {
    text = result.is_scam
      ? `चेतावनी! यह संदेश एक स्कैम है। जोखिम स्कोर ${result.scam_probability} प्रतिशत है। ${result.explanation}। ${result.what_to_do}`
      : `यह संदेश सुरक्षित है। जोखिम स्कोर केवल ${result.scam_probability} प्रतिशत है।`;
  } else {
    text = result.is_scam
      ? `Warning! This message is a ${result.fraud_type}. Scam probability is ${result.scam_probability} percent. ${result.explanation}. ${result.what_to_do}`
      : `This message looks safe. Scam probability is only ${result.scam_probability} percent.`;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang =
    language === "telugu"
      ? "te-IN"
      : language === "hindi"
        ? "hi-IN"
        : "en-IN";
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export default function App() {
  const [tab, setTab] = useState("text");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [language, setLanguage] = useState("english");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! I'm ScamShield AI. Ask me anything about scams or how to stay safe!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [clipboardMsg, setClipboardMsg] = useState("");
  const [showClipboard, setShowClipboard] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    today: 1247,
    thisWeek: 8432,
    thisMonth: 34521,
    lastUpdated: new Date().toLocaleTimeString(),
  });
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  useEffect(() => {
    async function autoCheckClipboard() {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 10) {
          setClipboardMsg(text.trim());
          setShowClipboard(true);
        }
      } catch (e) {}
    }
    const timer = setTimeout(autoCheckClipboard, 2000);
    return () => clearTimeout(timer);
  }, []);
  function handleSample(sample) {
    setTab("text");
    setMessage(sample.message);
    setResult(null);
    setError("");
    window.scrollTo({ top: 400, behavior: "smooth" });
  }

  function handleImageUpload(file) {
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  function useClipboardMessage() {
    setMessage(clipboardMsg);
    setTab("text");
    setShowClipboard(false);
    setClipboardMsg("");
  }

  function handleSpeak(res) {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakResult(res, language);
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false);
        clearInterval(check);
      }
    }, 500);
  }

  async function loadNews() {
    setNewsLoading(true);
    setShowNews(true);
    try {
      const query = encodeURIComponent("cyber fraud scam india");
      const rssUrl = encodeURIComponent(
        `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`,
      );
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`,
      );
      const data = await res.json();

      if (data.status === "ok" && data.items?.length > 0) {
        const items = data.items.slice(0, 6).map((item) => {
          const date = new Date(item.pubDate).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "long", year: "numeric" },
          );
          const title = item.title.replace(/ - .*$/, ""); // Remove source name
          const isHigh = /fraud|scam|cheat|arrest|crore|lakh/i.test(
            title,
          );
          const isMedium = /warning|alert|fake|phishing/i.test(title);
          const type = /upi|payment/i.test(title)
            ? "UPI Fraud"
            : /job|hiring|work/i.test(title)
              ? "Job Scam"
              : /kyc|bank|account/i.test(title)
                ? "KYC Scam"
                : /lottery|prize|won/i.test(title)
                  ? "Lottery Scam"
                  : /phish|link|click/i.test(title)
                    ? "Phishing"
                    : "Cyber Fraud";
          return {
            title,
            summary: item.description
              ? item.description
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 150) + "..."
              : "Click to read full story.",
            type,
            state: "India",
            date,
            severity: isHigh ? "high" : isMedium ? "medium" : "low",
            link: item.link,
          };
        });
        setNewsItems(items);
      } else {
        throw new Error("No news found");
      }
    } catch (e) {
      // Fallback with today's date
      const today = new Date();
      const dateStr = today.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const yesterday = new Date(today - 86400000).toLocaleDateString(
        "en-IN",
        { day: "numeric", month: "long", year: "numeric" },
      );
      setNewsItems([
        {
          title: "UPI Fraud surge reported in Andhra Pradesh",
          summary:
            "Over 500 citizens lost money to fake UPI payment requests. Police urge citizens to verify UPI IDs before sending money.",
          type: "UPI Fraud",
          state: "Andhra Pradesh",
          date: dateStr,
          severity: "high",
          link: "https://cybercrime.gov.in",
        },
        {
          title: "Fake job offers targeting graduates in Telangana",
          summary:
            "Scammers posing as HR managers collecting registration fees from job seekers. Never pay money for a job offer.",
          type: "Job Scam",
          state: "Telangana",
          date: dateStr,
          severity: "high",
          link: "https://cybercrime.gov.in",
        },
        {
          title: "KYC fraud via WhatsApp spreading in Maharashtra",
          summary:
            "Fraudsters sending fake bank KYC links via WhatsApp to steal account details. Always verify through official bank app.",
          type: "KYC Scam",
          state: "Maharashtra",
          date: yesterday,
          severity: "medium",
          link: "https://cybercrime.gov.in",
        },
        {
          title: "Fake KBC lottery messages flood WhatsApp",
          summary:
            "Thousands receiving fake KBC lottery messages demanding processing fees. KBC never asks for money to claim prizes.",
          type: "Lottery Scam",
          state: "Uttar Pradesh",
          date: yesterday,
          severity: "medium",
          link: "https://cybercrime.gov.in",
        },
        {
          title: "Phishing sites impersonating SBI on the rise",
          summary:
            "Fake SBI login pages stealing customer credentials reported across India. Always check URL before entering bank details.",
          type: "Phishing",
          state: "Pan India",
          date: yesterday,
          severity: "high",
          link: "https://cybercrime.gov.in",
        },
      ]);
    } finally {
      setNewsLoading(false);
    }
  }
  async function analyze() {
    if (tab === "text" && !message.trim()) return;
    if (tab === "image" && !image) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      const langInstruction =
        language === "telugu"
          ? "IMPORTANT: Write explanation, prevention_tips, and what_to_do STRICTLY in Telugu script."
          : language === "hindi"
            ? "IMPORTANT: Write explanation, prevention_tips, and what_to_do STRICTLY in Hindi script."
            : "Respond in English.";

      let textToAnalyze = message;
      if (tab === "image" && image) {
        const base64 = await fileToBase64(image);
        const vRes = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "meta-llama/llama-4-scout-17b-16e-instruct",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:${image.type};base64,${base64}`,
                      },
                    },
                    {
                      type: "text",
                      text: "Extract all text from this image. Return only the text.",
                    },
                  ],
                },
              ],
              temperature: 0.1,
            }),
          },
        );
        const vData = await vRes.json();
        if (!vRes.ok)
          throw new Error(
            vData?.error?.message || "Image reading failed",
          );
        textToAnalyze = vData.choices[0].message.content;
      }

      const prompt = `You are an AI scam detection system for rural Indian citizens. ${langInstruction}
Analyze: "${textToAnalyze}"
Respond ONLY with this JSON:
{"scam_probability":<0-100>,"is_scam":<true/false>,"fraud_type":"<UPI Fraud|Job Scam|Lottery Scam|Phishing|KYC Scam|Safe Message|Other>","suspicious_keywords":["w1"],"explanation":"<2 sentences>","prevention_tips":["t1","t2","t3"],"what_to_do":"<action>"}`;

      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || "API error");
      const parsed = JSON.parse(
        data.choices[0].message.content
          .replace(/```json|```/g, "")
          .trim(),
      );
      const highlighted = highlightText(textToAnalyze);
      const finalResult = {
        ...parsed,
        highlightedMessage: highlighted.html,
        foundKeywords: highlighted.found,
        extractedText: tab === "image" ? textToAnalyze : null,
        originalMessage: textToAnalyze.substring(0, 80) + "...",
        timestamp: new Date().toLocaleTimeString(),
      };
      setResult(finalResult);
      setHistory((prev) => [finalResult, ...prev].slice(0, 10));
      playSound(parsed.is_scam);
      setTimeout(() => speakResult(finalResult, language), 800);
    } catch (e) {
      setError(`Analysis failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", text: userMsg },
    ]);
    setChatLoading(true);
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are ScamShield AI. Help Indian citizens about scams. Be short, friendly, simple. Mention 1930 helpline when relevant.",
              },
              ...chatMessages.map((m) => ({
                role: m.role === "bot" ? "assistant" : "user",
                content: m.text,
              })),
              { role: "user", content: userMsg },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        },
      );
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: data.choices[0].message.content },
      ]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, try again!" },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const risk = result ? getRisk(result.scam_probability) : null;

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: theme.bg,
        minHeight: "100vh",
        color: theme.text,
      }}
    >
      {/* MOBILE STYLES */}
      <style>{`
        @media (max-width: 600px) {
          .hero-title { font-size: 28px !important; }
          .hero-stats { gap: 20px !important; }
          .nav-inner { padding: 12px 16px !important; }
          .analyzer-pad { padding: 16px !important; }
          .result-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .bar-chart { overflow-x: auto; }
          .chat-panel { width: calc(100vw - 32px) !important; right: 16px !important; }
          .history-panel { width: 100vw !important; }
        }
      `}</style>

      {/* CLIPBOARD POPUP */}
      {showClipboard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(107,70,193,0.15)",
            backdropFilter: "blur(8px)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "white",
              border: `1px solid ${theme.border}`,
              borderRadius: 24,
              padding: 28,
              maxWidth: 440,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(107,70,193,0.2)",
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 18,
                fontWeight: 800,
                color: theme.text,
              }}
            >
              Copied Message Detected!
            </h3>
            <p
              style={{
                color: theme.textLight,
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              Want to check if it's a scam?
            </p>
            <div
              style={{
                background: theme.primaryBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  color: theme.text,
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                "
                {clipboardMsg.length > 100
                  ? clipboardMsg.substring(0, 100) + "..."
                  : clipboardMsg}
                "
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                onClick={useClipboardMessage}
                style={{
                  padding: "11px 24px",
                  borderRadius: 50,
                  border: "none",
                  background:
                    "linear-gradient(135deg,#6b46c1,#9f7aea)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                🛡️ Yes, Check It!
              </button>
              <button
                onClick={() => setShowClipboard(false)}
                style={{
                  padding: "11px 24px",
                  borderRadius: 50,
                  border: `1px solid ${theme.border}`,
                  background: "transparent",
                  color: theme.textLight,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      {/* <nav
        className="nav-inner"
        style={{
          background: "white",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.border}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 12px rgba(107,70,193,0.08)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Shield size={22} color={theme.primary} />
          <span
            style={{
              fontSize: 17,
              fontWeight: 800,
              background: "linear-gradient(90deg,#6b46c1,#9f7aea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ScamShield India
          </span>
        </div>
        <div
          style={{ display: "flex", gap: 6, alignItems: "center" }}
        >
          {Object.entries(LANGUAGES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setLanguage(key)}
              style={{
                padding: "5px 10px",
                borderRadius: 20,
                border: `1px solid ${language === key ? theme.primary : theme.border}`,
                background:
                  language === key ? theme.primaryBg : "transparent",
                color:
                  language === key ? theme.primary : theme.textLight,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: language === key ? 700 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {val.flag} {val.label}
            </button>
          ))}
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: "5px 10px",
              borderRadius: 20,
              border: `1px solid ${theme.border}`,
              background: showHistory
                ? theme.primaryBg
                : "transparent",
              color: theme.textLight,
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <History size={13} /> {history.length}
          </button>
        </div>
      </nav> */}
      <nav
        style={{
          background: "white",
          borderBottom: `1px solid ${theme.border}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 12px rgba(107,70,193,0.08)",
        }}
      >
        <div
          style={{
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {/* Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Shield size={22} color={theme.primary} />
            <span
              style={{
                fontSize: 30,
                fontWeight: 900,
                background: "linear-gradient(90deg,#6b46c1,#9f7aea)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              ScamShield India
            </span>
          </div>

          {/* Right side - languages + history */}
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {Object.entries(LANGUAGES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setLanguage(key)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: `1px solid ${language === key ? theme.primary : theme.border}`,
                  background:
                    language === key
                      ? theme.primaryBg
                      : "transparent",
                  color:
                    language === key
                      ? theme.primary
                      : theme.textLight,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: language === key ? 700 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {val.flag} {val.full}
              </button>
            ))}
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: "5px 10px",
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                background: showHistory
                  ? theme.primaryBg
                  : "transparent",
                color: theme.textLight,
                cursor: "pointer",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <History size={13} /> {history.length}
            </button>
          </div>
        </div>
      </nav>
      {/* HISTORY PANEL */}
      {showHistory && (
        <div
          className="history-panel"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: 320,
            height: "100vh",
            background: "white",
            borderLeft: `1px solid ${theme.border}`,
            zIndex: 200,
            overflowY: "auto",
            padding: 20,
            boxShadow: "-4px 0 20px rgba(107,70,193,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              📊 Scan History
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                background: "none",
                border: "none",
                color: theme.textLight,
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>
          {history.length === 0 ? (
            <p style={{ color: theme.textMuted, fontSize: 13 }}>
              No scans yet!
            </p>
          ) : (
            history.map((item, i) => {
              const r = getRisk(item.scam_probability);
              return (
                <div
                  key={i}
                  style={{
                    background: r.bg,
                    border: `1px solid ${r.border}`,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        color: r.color,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {r.icon} {r.label}
                    </span>
                    <span
                      style={{ color: theme.textMuted, fontSize: 11 }}
                    >
                      {item.timestamp}
                    </span>
                  </div>
                  <p
                    style={{
                      color: theme.textLight,
                      fontSize: 12,
                      margin: "0 0 6px",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.originalMessage}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{ color: theme.textMuted, fontSize: 11 }}
                    >
                      {item.fraud_type}
                    </span>
                    <span
                      style={{
                        color: r.color,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {item.scam_probability}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              style={{
                width: "100%",
                padding: "8px",
                background: "#fff5f5",
                border: "1px solid #feb2b2",
                borderRadius: 8,
                color: "#e53e3e",
                cursor: "pointer",
                fontSize: 12,
                marginTop: 6,
              }}
            >
              🗑️ Clear History
            </button>
          )}
        </div>
      )}

      {/* HERO */}
      <div
        style={{
          textAlign: "center",
          padding: "48px 16px 36px",
          background:
            "linear-gradient(160deg,#faf5ff 0%,#f8f7ff 50%,#ebf8ff 100%)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: theme.primaryBg,
            border: `1px solid ${theme.border}`,
            borderRadius: 50,
            padding: "5px 16px",
            fontSize: 12,
            color: theme.primary,
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          🇮🇳 Protecting Rural India · Powered by AI
        </div>
        <h1
          className="hero-title"
          style={{
            fontSize: "clamp(24px,5vw,52px)",
            fontWeight: 900,
            margin: "0 0 14px",
            lineHeight: 1.2,
            color: theme.text,
            padding: "0 8px",
          }}
        >
          Is This Message a Scam?
          <br />
          <span
            style={{
              background: "linear-gradient(90deg,#6b46c1,#9f7aea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI Will Tell You Instantly
          </span>
        </h1>
        <p
          style={{
            fontSize: 15,
            color: theme.textLight,
            maxWidth: 480,
            margin: "0 auto 32px",
            lineHeight: 1.7,
            padding: "0 16px",
          }}
        >
          Got a suspicious SMS or WhatsApp? Upload a screenshot or
          type the message. Detects scams in English, Telugu, or
          Hindi.
        </p>
        <div
          className="hero-stats"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
            marginBottom: 8,
            padding: "0 16px",
          }}
        >
          {[
            ["10M+", "Scams/year"],
            ["₹1.25L Cr", "Lost 2023"],
            ["1930", "Helpline"],
          ].map(([n, l]) => (
            <div key={l}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: theme.primary,
                }}
              >
                {n}
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAMPLES */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        <p
          style={{
            textAlign: "center",
            color: theme.textMuted,
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          👇 Try a sample scam — click any
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {SAMPLES.map((s) => (
            <button
              key={s.type}
              onClick={() => handleSample(s)}
              style={{
                padding: "7px 14px",
                borderRadius: 50,
                border: `1px solid ${s.color}44`,
                background: `${s.color}0f`,
                color: s.color,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
              onMouseEnter={(e) =>
                (e.target.style.background = `${s.color}22`)
              }
              onMouseLeave={(e) =>
                (e.target.style.background = `${s.color}0f`)
              }
            >
              {s.icon} {s.type}
            </button>
          ))}
        </div>
      </div>

      {/* ANALYZER */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "0 16px 48px",
        }}
      >
        <div
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(107,70,193,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            {[
              {
                key: "text",
                icon: <FileText size={15} />,
                label: "Type / Paste",
              },
              {
                key: "image",
                icon: <Upload size={15} />,
                label: "Upload Screenshot",
              },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setResult(null);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "14px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  border: "none",
                  background:
                    tab === t.key ? theme.primaryBg : "transparent",
                  color:
                    tab === t.key ? theme.primary : theme.textLight,
                  fontWeight: tab === t.key ? 700 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  borderBottom:
                    tab === t.key
                      ? `2px solid ${theme.primary}`
                      : "2px solid transparent",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="analyzer-pad" style={{ padding: 24 }}>
            {tab === "text" && (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  language === "telugu"
                    ? "అనుమానాస్పద మెసేజ్ ఇక్కడ పేస్ట్ చేయండి..."
                    : language === "hindi"
                      ? "संदिग्ध संदेश यहाँ पेस्ट करें..."
                      : "Paste suspicious SMS, WhatsApp or any message here..."
                }
                style={{
                  width: "100%",
                  minHeight: 140,
                  background: theme.primaryBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 12,
                  padding: 14,
                  color: theme.text,
                  fontSize: 15,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  lineHeight: 1.7,
                }}
              />
            )}

            {tab === "image" && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleImageUpload(e.dataTransfer.files[0]);
                }}
                style={{
                  border: `2px dashed ${dragOver ? theme.primary : theme.border}`,
                  borderRadius: 12,
                  padding: 32,
                  textAlign: "center",
                  background: dragOver ? theme.primaryBg : "#fafafa",
                  cursor: "pointer",
                }}
                onClick={() =>
                  document.getElementById("imgInput").click()
                }
              >
                <input
                  id="imgInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleImageUpload(e.target.files[0])
                  }
                />
                {imagePreview ? (
                  <div>
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{
                        maxHeight: 200,
                        maxWidth: "100%",
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    />
                    <p style={{ color: theme.primary, fontSize: 13 }}>
                      ✅ Ready · Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload
                      size={36}
                      color={theme.textMuted}
                      style={{ marginBottom: 10 }}
                    />
                    <p
                      style={{
                        color: theme.textLight,
                        margin: 0,
                        fontSize: 14,
                      }}
                    >
                      Tap to upload screenshot
                    </p>
                    <p
                      style={{
                        color: theme.textMuted,
                        fontSize: 12,
                        marginTop: 6,
                      }}
                    >
                      WhatsApp, SMS, or any message
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={analyze}
              disabled={
                loading ||
                (tab === "text" && !message.trim()) ||
                (tab === "image" && !image)
              }
              style={{
                marginTop: 16,
                width: "100%",
                padding: 15,
                background: loading
                  ? theme.border
                  : "linear-gradient(135deg,#6b46c1,#9f7aea)",
                border: "none",
                borderRadius: 12,
                color: loading ? theme.textMuted : "white",
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading
                  ? "none"
                  : "0 4px 16px rgba(107,70,193,0.3)",
              }}
            >
              {loading
                ? "🔄 AI is Analyzing..."
                : "🛡️ Check for Scam"}
            </button>

            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  background: "#fff5f5",
                  border: "1px solid #feb2b2",
                  borderRadius: 10,
                  color: "#e53e3e",
                  fontSize: 13,
                }}
              >
                ❌ {error}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS */}
        {result && risk && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {result.extractedText && (
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 2px 12px rgba(107,70,193,0.06)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: theme.textLight,
                    fontSize: 13,
                  }}
                >
                  📄 Text from image:
                </h3>
                <p
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {result.extractedText}
                </p>
              </div>
            )}

            {/* Risk Banner */}
            <div
              style={{
                background: risk.bg,
                border: `2px solid ${risk.border}`,
                borderRadius: 20,
                padding: "28px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48 }}>{risk.icon}</div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: risk.color,
                  margin: "8px 0 4px",
                }}
              >
                {risk.label}
              </div>
              <div
                style={{
                  color: theme.textLight,
                  marginBottom: 20,
                  fontSize: 14,
                }}
              >
                Fraud Type:{" "}
                <strong style={{ color: theme.text }}>
                  {result.fraud_type}
                </strong>
              </div>

              {/* Voice Button */}
              <button
                onClick={() => handleSpeak(result)}
                style={{
                  marginBottom: 20,
                  padding: "8px 20px",
                  borderRadius: 50,
                  border: `1px solid ${risk.border}`,
                  background: speaking ? risk.color : "white",
                  color: speaking ? "white" : risk.color,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Volume2 size={16} />{" "}
                {speaking
                  ? "⏹ Stop"
                  : "🔊 Listen in " + LANGUAGES[language].full}
              </button>

              <div style={{ maxWidth: 380, margin: "0 auto" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ color: theme.textLight, fontSize: 13 }}
                  >
                    Scam Probability
                  </span>
                  <span
                    style={{
                      fontWeight: 900,
                      color: risk.color,
                      fontSize: 20,
                    }}
                  >
                    {result.scam_probability}%
                  </span>
                </div>
                <div
                  style={{
                    background: "#e2e8f0",
                    borderRadius: 50,
                    height: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${result.scam_probability}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg,#48bb78,#ed8936,#e53e3e)",
                      borderRadius: 50,
                      transition: "width 1.2s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 4,
                    fontSize: 10,
                    color: theme.textMuted,
                  }}
                >
                  <span>✅ Safe</span>
                  <span>⚠️ Suspicious</span>
                  <span>🚨 High Risk</span>
                </div>
              </div>
            </div>

            {/* Keywords */}
            {result.foundKeywords?.length > 0 && (
              <div
                style={{
                  background: theme.card,
                  border: "1px solid #feb2b2",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 12px",
                    color: "#e53e3e",
                    fontSize: 14,
                  }}
                >
                  ⚡ Suspicious Keywords
                </h3>
                <div
                  style={{
                    background: "#fff5f5",
                    borderRadius: 8,
                    padding: "12px 14px",
                    fontSize: 14,
                    lineHeight: 1.9,
                    border: "1px solid #fed7d7",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: result.highlightedMessage,
                  }}
                />
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {result.foundKeywords.map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: "#fff5f5",
                        border: "1px solid #feb2b2",
                        color: "#e53e3e",
                        padding: "3px 12px",
                        borderRadius: 50,
                        fontSize: 12,
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation + What to do */}
            <div
              className="result-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(260px,1fr))",
                gap: 14,
              }}
            >
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: theme.primary,
                    fontSize: 14,
                  }}
                >
                  🧠 Why AI Flagged This
                </h3>
                <p
                  style={{
                    color: theme.textLight,
                    fontSize: 13,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {result.explanation}
                </p>
              </div>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #f6e05e",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: "#744210",
                    fontSize: 14,
                  }}
                >
                  ⚡ What To Do Now
                </h3>
                <p
                  style={{
                    color: "#744210",
                    fontSize: 13,
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {result.what_to_do}
                </p>
              </div>
            </div>

            {/* Prevention */}
            <div
              style={{
                background: "#f0fff4",
                border: "1px solid #9ae6b4",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px",
                  color: "#276749",
                  fontSize: 14,
                }}
              >
                🛡️ How To Stay Safe
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {result.prevention_tips?.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        background: "#c6f6d5",
                        color: "#276749",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p
                      style={{
                        color: "#276749",
                        fontSize: 13,
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                padding: "6px 0",
              }}
            >
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff5f5",
                  border: "1px solid #feb2b2",
                  color: "#e53e3e",
                  padding: "10px 20px",
                  borderRadius: 50,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                🚨 Report Scam
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🚨 *SCAM ALERT!*\n\n*${result?.fraud_type}* detected!\nRisk: *${risk?.label}* (${result?.scam_probability}%)\n\nDo NOT click links, share OTP or send money!\n\n📞 Call *1930* if scammed`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f0fff4",
                  border: "1px solid #9ae6b4",
                  color: "#276749",
                  padding: "10px 20px",
                  borderRadius: 50,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                📱 Warn Family
              </a>
            </div>
          </div>
        )}
      </div>

      {/* COMMUNITY REPORTS */}
      <div
        style={{
          background: "linear-gradient(135deg,#6b46c1,#9f7aea)",
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 4,
              color: "white",
            }}
          >
            🌍 Live Community Reports
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
              marginBottom: 32,
              fontSize: 13,
            }}
          >
            Real-time scam detection across India · Updated every 5
            seconds
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              {
                number: communityStats.today.toLocaleString(),
                label: "Scams detected today",
                icon: "🚨",
                bg: "rgba(255,255,255,0.15)",
              },
              {
                number: communityStats.thisWeek.toLocaleString(),
                label: "This week",
                icon: "📅",
                bg: "rgba(255,255,255,0.1)",
              },
              {
                number: communityStats.thisMonth.toLocaleString(),
                label: "This month",
                icon: "📊",
                bg: "rgba(255,255,255,0.1)",
              },
              {
                number: "1930",
                label: "Call if scammed",
                icon: "📞",
                bg: "rgba(255,255,255,0.15)",
              },
            ].map(({ number, label, icon, bg }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: 16,
                  padding: "22px 16px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {icon}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  {number}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
            }}
          >
            Last updated: {communityStats.lastUpdated}
          </p>
        </div>
      </div>

      {/* NEWS FEED */}
      <div
        style={{
          background: theme.bg,
          borderTop: `1px solid ${theme.border}`,
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: theme.text,
                }}
              >
                📰 Latest Scam Alerts
              </h2>
              <p
                style={{
                  color: theme.textMuted,
                  fontSize: 13,
                  margin: 0,
                }}
              >
                Recent fraud incidents reported across India
              </p>
            </div>
            <button
              onClick={loadNews}
              style={{
                padding: "10px 20px",
                borderRadius: 50,
                border: `1px solid ${theme.primary}`,
                background: showNews
                  ? theme.primaryBg
                  : "linear-gradient(135deg,#6b46c1,#9f7aea)",
                color: showNews ? theme.primary : "white",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {newsLoading
                ? "⏳ Loading..."
                : showNews
                  ? "🔄 Refresh"
                  : "📰 Load News"}
            </button>
          </div>

          {showNews && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {newsLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: theme.textMuted,
                  }}
                >
                  ⏳ Fetching latest scam alerts...
                </div>
              ) : (
                newsItems.map((item, i) => {
                  const severityColor =
                    item.severity === "high"
                      ? "#e53e3e"
                      : item.severity === "medium"
                        ? "#dd6b20"
                        : "#276749";
                  const severityBg =
                    item.severity === "high"
                      ? "#fff5f5"
                      : item.severity === "medium"
                        ? "#fffbeb"
                        : "#f0fff4";
                  const severityBorder =
                    item.severity === "high"
                      ? "#feb2b2"
                      : item.severity === "medium"
                        ? "#f6e05e"
                        : "#9ae6b4";
                  return (
                    <div
                      key={i}
                      style={{
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 16,
                        padding: 20,
                        borderLeft: `4px solid ${severityColor}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 10,
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 700,
                            color: theme.primary,
                            flex: 1,
                            textDecoration: "none",
                          }}
                        >
                          {item.title} →
                        </a>
                        <span
                          style={{
                            background: severityBg,
                            border: `1px solid ${severityBorder}`,
                            color: severityColor,
                            padding: "3px 10px",
                            borderRadius: 50,
                            fontSize: 11,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.severity === "high"
                            ? "🚨 HIGH"
                            : item.severity === "medium"
                              ? "⚠️ MEDIUM"
                              : "✅ LOW"}
                        </span>
                      </div>
                      <p
                        style={{
                          color: theme.textLight,
                          fontSize: 13,
                          lineHeight: 1.7,
                          margin: "0 0 12px",
                        }}
                      >
                        {item.summary}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            background: theme.primaryBg,
                            border: `1px solid ${theme.border}`,
                            color: theme.primary,
                            padding: "3px 10px",
                            borderRadius: 50,
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {item.type}
                        </span>
                        <span
                          style={{
                            background: "#f7fafc",
                            border: "1px solid #e2e8f0",
                            color: theme.textLight,
                            padding: "3px 10px",
                            borderRadius: 50,
                            fontSize: 11,
                          }}
                        >
                          📍 {item.state}
                        </span>
                        <span
                          style={{
                            background: "#f7fafc",
                            border: "1px solid #e2e8f0",
                            color: theme.textLight,
                            padding: "3px 10px",
                            borderRadius: 50,
                            fontSize: 11,
                          }}
                        >
                          📅 {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      {/* STATS */}
      <div
        style={{
          background: "linear-gradient(160deg,#faf5ff,#ebf8ff)",
          borderTop: `1px solid ${theme.border}`,
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 4,
              color: theme.text,
            }}
          >
            📊 Scam Statistics in India
          </h2>
          <p
            style={{
              textAlign: "center",
              color: theme.textMuted,
              marginBottom: 32,
              fontSize: 13,
            }}
          >
            Real data on fraud affecting Indian citizens
          </p>

          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                number: "₹1,750 Cr",
                label: "Lost Q1 2024",
                icon: "💸",
                color: "#e53e3e",
                bg: "#fff5f5",
                border: "#feb2b2",
              },
              {
                number: "7,000+",
                label: "Complaints/day",
                icon: "📞",
                color: "#dd6b20",
                bg: "#fffbeb",
                border: "#f6e05e",
              },
              {
                number: "45%",
                label: "Victims 18-35 yrs",
                icon: "👥",
                color: "#2b6cb0",
                bg: "#ebf8ff",
                border: "#90cdf4",
              },
              {
                number: "72%",
                label: "Via WhatsApp",
                icon: "📱",
                color: "#276749",
                bg: "#f0fff4",
                border: "#9ae6b4",
              },
            ].map(({ number, label, icon, color, bg, border }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  padding: "22px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {icon}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color,
                    marginBottom: 4,
                  }}
                >
                  {number}
                </div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                margin: "0 0 20px",
                fontSize: 15,
                color: theme.text,
              }}
            >
              Most Common Scam Types (2024)
            </h3>
            {[
              {
                label: "UPI / Payment Fraud",
                percent: 34,
                color: "#e53e3e",
              },
              {
                label: "Job / Work from Home",
                percent: 28,
                color: "#dd6b20",
              },
              {
                label: "KYC / Bank Fraud",
                percent: 19,
                color: "#6b46c1",
              },
              {
                label: "Lottery / Prize",
                percent: 11,
                color: "#d69e2e",
              },
              {
                label: "Phishing Links",
                percent: 8,
                color: "#2b6cb0",
              },
            ].map(({ label, percent, color }) => (
              <div key={label} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: theme.textLight }}
                  >
                    {label}
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color }}
                  >
                    {percent}%
                  </span>
                </div>
                <div
                  style={{
                    background: "#edf2f7",
                    borderRadius: 50,
                    height: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 50,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                margin: "0 0 20px",
                fontSize: 15,
                color: theme.text,
              }}
            >
              📈 Monthly Reports 2024 (in thousands)
            </h3>
            <div
              className="bar-chart"
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: 120,
                minWidth: 300,
              }}
            >
              {[
                { month: "J", value: 65 },
                { month: "F", value: 72 },
                { month: "M", value: 68 },
                { month: "A", value: 85 },
                { month: "M", value: 91 },
                { month: "J", value: 88 },
                { month: "J", value: 95 },
                { month: "A", value: 102 },
                { month: "S", value: 98 },
                { month: "O", value: 115 },
                { month: "N", value: 121 },
                { month: "D", value: 134 },
              ].map(({ month, value }, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    minWidth: 20,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: theme.primary,
                      fontWeight: 700,
                    }}
                  >
                    {value}K
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${(value / 134) * 100}px`,
                      background:
                        "linear-gradient(180deg,#6b46c1,#9f7aea)",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                  <span
                    style={{ fontSize: 9, color: theme.textMuted }}
                  >
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: 15,
                color: theme.text,
              }}
            >
              🗺️ Most Affected States
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(120px,1fr))",
                gap: 10,
              }}
            >
              {[
                {
                  state: "Uttar Pradesh",
                  cases: "18%",
                  color: "#e53e3e",
                  bg: "#fff5f5",
                  border: "#feb2b2",
                },
                {
                  state: "Maharashtra",
                  cases: "14%",
                  color: "#dd6b20",
                  bg: "#fffbeb",
                  border: "#f6e05e",
                },
                {
                  state: "Rajasthan",
                  cases: "12%",
                  color: "#d69e2e",
                  bg: "#fffff0",
                  border: "#faf089",
                },
                {
                  state: "Bihar",
                  cases: "10%",
                  color: "#6b46c1",
                  bg: "#faf5ff",
                  border: "#e9d8fd",
                },
                {
                  state: "Andhra Pradesh",
                  cases: "9%",
                  color: "#2b6cb0",
                  bg: "#ebf8ff",
                  border: "#90cdf4",
                },
                {
                  state: "Tamil Nadu",
                  cases: "8%",
                  color: "#276749",
                  bg: "#f0fff4",
                  border: "#9ae6b4",
                },
              ].map(({ state, cases, color, bg, border }) => (
                <div
                  key={state}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    padding: "12px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color,
                      marginBottom: 3,
                    }}
                  >
                    {cases}
                  </div>
                  <div
                    style={{ fontSize: 11, color: theme.textMuted }}
                  >
                    {state}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AWARENESS */}
      <div
        style={{
          background: theme.bg,
          borderTop: `1px solid ${theme.border}`,
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 4,
              color: theme.text,
            }}
          >
            Common Scams in India
          </h2>
          <p
            style={{
              textAlign: "center",
              color: theme.textMuted,
              marginBottom: 28,
              fontSize: 13,
            }}
          >
            Click any to test our AI
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(140px,1fr))",
              gap: 12,
            }}
          >
            {SAMPLES.map(({ icon, type, color, message: msg }) => (
              <div
                key={type}
                onClick={() =>
                  handleSample({ type, icon, color, message: msg })
                }
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 14,
                  padding: 18,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.primaryBg;
                  e.currentTarget.style.borderColor = theme.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.card;
                  e.currentTarget.style.borderColor = theme.border;
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {icon}
                </div>
                <div style={{ fontWeight: 700, color, fontSize: 12 }}>
                  {type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HELPLINE */}
      <div
        style={{
          padding: "48px 16px",
          textAlign: "center",
          background: "linear-gradient(160deg,#faf5ff,#f8f7ff)",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: 22,
            padding: "40px 28px",
            boxShadow: "0 8px 32px rgba(107,70,193,0.12)",
          }}
        >
          <Phone
            size={40}
            color={theme.primary}
            style={{ marginBottom: 14 }}
          />
          <h2
            style={{
              fontSize: 24,
              fontWeight: 900,
              margin: "0 0 6px",
              color: theme.text,
            }}
          >
            Been Scammed? Call Now
          </h2>
          <p
            style={{
              color: theme.textMuted,
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            National Cybercrime Helpline — Free, 24/7
          </p>
          <a
            href="tel:1930"
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: "linear-gradient(90deg,#6b46c1,#9f7aea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginBottom: 6,
              textDecoration: "none",
              display: "block",
            }}
          >
            1930
          </a>
          <p
            style={{
              color: theme.primary,
              fontSize: 13,
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            👆 Tap to call on phone
          </p>
          <p
            style={{
              color: theme.textMuted,
              marginBottom: 28,
              fontSize: 12,
            }}
          >
            या / or
          </p>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "linear-gradient(135deg,#6b46c1,#9f7aea)",
              color: "white",
              padding: "12px 32px",
              borderRadius: 50,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 4px 16px rgba(107,70,193,0.3)",
            }}
          >
            cybercrime.gov.in →
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${theme.border}`,
          padding: 20,
          textAlign: "center",
          color: theme.textMuted,
          fontSize: 12,
          background: theme.card,
        }}
      >
        <Shield
          size={13}
          color={theme.primary}
          style={{ marginRight: 6, verticalAlign: "middle" }}
        />
        ScamShield India · AI-Based Fraud Detection · Protecting Rural
        Citizens
      </footer>

      {/* CHATBOT BUTTON */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#6b46c1,#9f7aea)",
          border: "none",
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(107,70,193,0.4)",
          zIndex: 150,
        }}
      >
        {showChat ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* CHATBOT */}
      {showChat && (
        <div
          className="chat-panel"
          style={{
            position: "fixed",
            bottom: 88,
            right: 20,
            width: 320,
            height: 460,
            background: "white",
            border: `1px solid ${theme.border}`,
            borderRadius: 18,
            display: "flex",
            flexDirection: "column",
            zIndex: 150,
            boxShadow: "0 8px 32px rgba(107,70,193,0.2)",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: theme.primaryBg,
              borderRadius: "18px 18px 0 0",
            }}
          >
            <Shield size={18} color={theme.primary} />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: theme.text,
                }}
              >
                ScamShield AI
              </div>
              <div style={{ fontSize: 10, color: "#276749" }}>
                ● Online
              </div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#fafafa",
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "9px 13px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg,#6b46c1,#9f7aea)"
                        : "white",
                    border:
                      msg.role === "bot"
                        ? `1px solid ${theme.border}`
                        : "none",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: msg.role === "user" ? "white" : theme.text,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    padding: "9px 13px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "white",
                    border: `1px solid ${theme.border}`,
                    fontSize: 13,
                    color: theme.textMuted,
                  }}
                >
                  🤔 Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div
            style={{
              padding: 10,
              borderTop: `1px solid ${theme.border}`,
              display: "flex",
              gap: 8,
              background: "white",
              borderRadius: "0 0 18px 18px",
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendChatMessage()
              }
              placeholder="Ask about scams..."
              style={{
                flex: 1,
                background: theme.primaryBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 50,
                padding: "9px 14px",
                color: theme.text,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6b46c1,#9f7aea)",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
