import { useRef, useState } from "react";
import {
  Bot,
  Send,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  GraduationCap,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachment?: {
    name: string;
    type: string;
  };
};

type StudyMode = "Ask" | "Learn" | "Practice" | "Test";

export default function AIStudyBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "नमस्ते! मैं आपका AI Study Bot हूँ। आप किसी भी exam, subject या topic के बारे में पूछ सकते हैं। आप Image/PDF भी upload कर सकते हैं।",
    },
  ]);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<StudyMode>("Ask");
  const [exam, setExam] = useState("Any Exam");
  const [subject, setSubject] = useState("Any Subject");

  const [attachment, setAttachment] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sendMessage = () => {
    const text = input.trim();

    if (!text && !attachment) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text || "इस file को analyze करो।",
      attachment: attachment
        ? {
            name: attachment.name,
            type: attachment.type,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setAttachment(null);

    /*
      अभी actual AI API call नहीं है।

      अगले step में यही जगह:
      /api/ai/chat
      backend endpoint को call करेगी।
    */

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "आपका message receive हो गया है। अगले implementation step में मैं selected AI provider से इसका वास्तविक AI answer दूँगा।",
        },
      ]);
    }, 500);
  };

  const handleFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    if (!isImage && !isPdf) {
      alert("केवल Image या PDF upload करें।");
      return;
    }

    setAttachment(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[650px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <h2 className="font-bold text-slate-100">
                AI Study Bot
              </h2>

              <p className="text-xs text-slate-500">
                Any Exam • Any Subject • AI Learning
              </p>
            </div>

          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Ready
          </div>

        </div>

        {/* Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">

          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
          >
            <option>Any Exam</option>
            <option>RRB Group D</option>
            <option>SSC MTS</option>
            <option>SSC GD</option>
            <option>SSC CHSL</option>
            <option>RRB NTPC</option>
            <option>NEET</option>
            <option>JEE</option>
            <option>Banking</option>
            <option>UPSC</option>
            <option>Other</option>
          </select>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
          >
            <option>Any Subject</option>
            <option>Mathematics</option>
            <option>Reasoning</option>
            <option>Science</option>
            <option>GK</option>
            <option>Current Affairs</option>
            <option>English</option>
            <option>Hindi</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Biology</option>
            <option>Computer</option>
            <option>Other</option>
          </select>

          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as StudyMode)
            }
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300"
          >
            <option>Ask</option>
            <option>Learn</option>
            <option>Practice</option>
            <option>Test</option>
          </select>

        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {messages.map((message) => (

          <div
            key={message.id}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-200"
              }`}
            >

              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2 text-xs text-amber-400 font-bold">
                  <Bot className="w-4 h-4" />
                  AI Study Bot
                </div>
              )}

              {message.attachment && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-black/20">
                  {message.attachment.type.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}

                  <span className="text-xs truncate">
                    {message.attachment.name}
                  </span>
                </div>
              )}

              <p className="text-sm leading-6 whitespace-pre-wrap">
                {message.content}
              </p>

            </div>

          </div>

        ))}

      </div>

      {/* Mode shortcuts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">

        {[
          "मुझे इस topic को पढ़ाओ",
          "10 MCQ पूछो",
          "इस question को समझाओ",
          "इस PDF से test लो",
        ].map((suggestion) => (

          <button
            key={suggestion}
            onClick={() => setInput(suggestion)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-400 hover:text-slate-200 hover:border-amber-500"
          >
            {suggestion}
          </button>

        ))}

      </div>

      {/* Attachment */}
      {attachment && (
        <div className="mx-4 mb-2 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">

          <div className="flex items-center gap-2 min-w-0">

            {attachment.type.startsWith("image/") ? (
              <ImageIcon className="w-4 h-4 text-sky-400" />
            ) : (
              <FileText className="w-4 h-4 text-rose-400" />
            )}

            <span className="text-xs text-slate-300 truncate">
              {attachment.name}
            </span>

          </div>

          <button
            onClick={() => setAttachment(null)}
            className="text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">

        <div className="flex items-end gap-2">

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                handleFile(file);
              }

              e.currentTarget.value = "";
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex-shrink-0 rounded-xl border border-slate-700 bg-slate-950 text-slate-400 hover:text-amber-400 hover:border-amber-500 flex items-center justify-center"
            title="Upload Image/PDF"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Ask anything about ${subject}...`}
            rows={2}
            className="flex-1 resize-none bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() && !attachment}
            className="w-11 h-11 flex-shrink-0 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>

        </div>

        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600">
          <GraduationCap className="w-3 h-3" />
          <span>
            Study Mode: {mode} • {exam} • {subject}
          </span>
        </div>

      </div>

    </div>
  );
}
