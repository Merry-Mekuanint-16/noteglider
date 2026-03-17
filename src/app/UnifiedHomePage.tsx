"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import mammoth from "mammoth";
import ModernNavbar from "~/components/ModernNavbar";
import HistoryDrawer from "~/components/HistoryDrawer";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Check, Copy, Download, Loader2, UploadCloud, Lock } from "lucide-react";
import { toast } from "sonner";
import { getHumanizerHistory } from "~/actions/humanizer";
import PolarPricing from "~/components/pricing/PolarPricing";
import TopUpSection from "~/components/pricing/TopUpSection";
import { cn } from "~/lib/utils";
import { SiteFooter } from "~/components/SiteFooter";

const STUDY_MODES = [
  { value: "summary", label: "Summary", icon: "📝", isPremium: false },
  { value: "flashcards", label: "Flashcards", icon: "🎴", isPremium: false },
  { value: "quiz", label: "Quiz", icon: "❓", isPremium: true },
  { value: "audio", label: "Audio Learning", icon: "🎧", isPremium: true },
];

const PROCESSING_STEPS = [
  "Analyzing your notes",
  "Extracting key concepts",
  "Organizing information",
  "Generating content",
  "Finalizing output",
];

const DETECTOR_NAMES = [
  { name: "Summary", logo: "/logo/turnitin.png" },
  { name: "Flashcards", logo: "/logo/GPTZero.png" },
  { name: "Quiz", logo: "/logo/copyleaks.png" },
  { name: "Audio", logo: "/logo/zeroGPT.png" },
];

interface HistoryItem {
  id: string;
  originalText: string;
  humanizedText: string;
  preset: string;
  tokensUsed: number;
  aiScore: number | null;
  createdAt: Date;
}

export default function UnifiedHomePage() {
  const { isSignedIn, user } = useUser();
  const [originalText, setOriginalText] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [studyMode, setStudyMode] = useState("summary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentCredits, setCurrentCredits] = useState<number | undefined>(undefined);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [currentAiScore, setCurrentAiScore] = useState<number | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [thoughtsList, setThoughtsList] = useState<string[]>([]);
  const processTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isProcessing) return;
    setThoughtsList([PROCESSING_STEPS[0] || ""]);
    const scheduleNext = () => {
      const randomDelay = Math.floor(Math.random() * 2000) + 1500;
      processTimeoutRef.current = setTimeout(() => {
        setThoughtsList(prev => {
          const idx = PROCESSING_STEPS.indexOf(prev[0] || "");
          const nextIdx = (idx + 1) % PROCESSING_STEPS.length;
          return [PROCESSING_STEPS[nextIdx] || ""];
        });
        scheduleNext();
      }, randomDelay);
    };
    scheduleNext();
    return () => { if (processTimeoutRef.current) clearTimeout(processTimeoutRef.current); };
  }, [isProcessing]);

  useEffect(() => {
    if (generatedContent.length >= 50) {
      setThoughtsList([]);
      if (processTimeoutRef.current) clearTimeout(processTimeoutRef.current);
    }
  }, [generatedContent.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCurrentCredits((data.credits || 0) + (data.extraCredits || 0));
        setSubscriptionPlan(data.subscriptionPlan || null);
        setIsTeamMember(data.isTeamMember || false);
      }
    } catch (error) { console.error("Failed to fetch credits:", error); }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const result = await getHumanizerHistory();
      if (result.success && result.history) setHistory(result.history);
    } catch (error) { console.error("Failed to fetch history:", error); }
  }, []);

  useEffect(() => { if (isSignedIn) { fetchCredits(); fetchHistory(); } }, [isSignedIn, fetchCredits, fetchHistory]);

  const handleHumanize = useCallback(async () => {
    if (!originalText.trim()) { toast.error("Please enter some text"); return; }
    if (!isSignedIn) { setShowSignInPrompt(true); toast.error("Please sign in"); return; }
    const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) { toast.error("Minimum 50 words required"); return; }
    if (currentCredits === undefined) { toast.info("Syncing credits..."); await fetchCredits(); return; }
    if (currentCredits < wordCount) { toast.error("Insufficient credits"); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); return; }

    setIsHumanizing(true);
    setHumanizedText("");
    setThoughtsList([]);
    setCurrentAiScore(null);

    try {
      const response = await fetch("/api/humanizer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, preset: tone, tone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to humanize");
        setIsHumanizing(false);
        return;
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let buffer = "";
      let streamCompleted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;
          const data = trimmedLine.slice(6);
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            if (json.type === "complete") {
              streamCompleted = true;
              setCurrentAiScore(100);
              setIsHumanizing(false);
              setThoughtsList([]);
              toast.success(`Done! ${json.credits_remaining} credits left.`);
              void fetchCredits();
              void fetchHistory();
              continue;
            }
            if (!json.type || json.type === "content") {
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                accumulatedText += content;
                if (accumulatedText.length > 50) setThoughtsList([]);
                setHumanizedText(accumulatedText);
              }
            }
          } catch {}
        }
      }

      if (!streamCompleted && accumulatedText.length > 0) {
        setIsHumanizing(false);
        setCurrentAiScore(100);
      }
    } catch {
      toast.error("Failed to humanize text");
      setIsHumanizing(false);
    }
  }, [originalText, isSignedIn, currentCredits, tone, fetchCredits, fetchHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && originalText.trim() && !isHumanizing && isSignedIn) {
        e.preventDefault();
        void handleHumanize();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [originalText, isHumanizing, isSignedIn, handleHumanize]);

  const handleCopy = async () => {
    if (!humanizedText) return;
    await navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!humanizedText) return;
    const blob = new Blob([humanizedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "humanized.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const processFile = async (file: File) => {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (![".txt", ".docx", ".pdf"].includes(ext)) { toast.error("Unsupported file type"); return; }

    if (ext === ".docx") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value?.trim()) { setOriginalText(result.value); setUploadedFileName(file.name); toast.success(`Loaded: ${file.name}`); }
      } catch { toast.error("Failed to read file"); }
      return;
    }

    if (ext === ".pdf") {
      try {
        // @ts-ignore
        const pdfjsLib = await import("pdfjs-dist");
        if (typeof window !== "undefined") pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (await pdfjsLib.getDocument({ data: arrayBuffer }).promise);
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n";
        }
        if (fullText.trim()) { setOriginalText(fullText.trim()); setUploadedFileName(file.name); toast.success(`Loaded: ${file.name}`); }
      } catch { toast.error("Failed to read PDF"); }
      return;
    }

    if (ext === ".txt") {
      const reader = new FileReader();
      reader.onload = (e) => { if (typeof e.target?.result === "string") { setOriginalText(e.target.result); setUploadedFileName(file.name); } };
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ""; };
  const handleDrop = (e: DragEvent<HTMLDivElement | HTMLTextAreaElement>) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e: DragEvent<HTMLDivElement | HTMLTextAreaElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement | HTMLTextAreaElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleHistorySelect = (item: HistoryItem) => { setOriginalText(item.originalText); setHumanizedText(item.humanizedText); setTone(item.preset); };

  const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = originalText.length;
  const showOutputPanel = isHumanizing || Boolean(humanizedText);
  const hasAccess = subscriptionPlan === "pro" || subscriptionPlan === "ultra" || subscriptionPlan === "lifetime";

  return (
    <div className="min-h-screen" style={{ background: '#FFF9F0' }}>
      <ModernNavbar 
        onHistoryClick={() => setHistoryOpen(true)}
        currentCredits={currentCredits}
        isTeamMember={isTeamMember}
      />
      <HistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onSelectItem={handleHistorySelect}
      />

      {/* Hero Section with Playful Design */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-pink-400 rounded-full opacity-60 float-animation" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-teal-400 rounded-full opacity-50 float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-yellow-400 rounded-full opacity-60 wiggle-animation"></div>
        
        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          {/* Main Headline with Hand-drawn Frame */}
          <div className="relative inline-block mb-8">
            <div className="hand-drawn-border bg-white p-8 md:p-12 shadow-2xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-tight">
                MAKE AI SOUND
                <br />
                <span className="text-green-500">HUMAN.</span>
              </h1>
            </div>
            
            {/* Floating Pills around headline */}
            <span 
              className="absolute px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold shadow-lg hidden md:block"
              style={{ top: '-20px', left: '-80px', transform: 'rotate(-12deg)' }}
            >
              ✨ Students
            </span>
            
            <span 
              className="absolute px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold shadow-lg hidden md:block"
              style={{ top: '20px', right: '-100px', transform: 'rotate(8deg)' }}
            >
              📝 Writers
            </span>
            
            <span 
              className="absolute px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-bold shadow-lg hidden md:block"
              style={{ bottom: '40px', left: '-120px', transform: 'rotate(-6deg)' }}
            >
              🔬 Researchers
            </span>
            
            <span 
              className="absolute px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold shadow-lg hidden md:block"
              style={{ bottom: '-10px', right: '-90px', transform: 'rotate(10deg)' }}
            >
              📊 Marketers
            </span>
          </div>
          
          {/* Mobile Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 md:hidden">
            {[
              { label: "✨ Students", color: "bg-green-500" },
              { label: "📝 Writers", color: "bg-blue-500" },
              { label: "🔬 Researchers", color: "bg-purple-500" },
              { label: "📊 Marketers", color: "bg-orange-500" }
            ].map((pill) => (
              <span
                key={pill.label}
                className={`px-3 py-1.5 ${pill.color} text-white rounded-full text-xs font-bold shadow-md`}
              >
                {pill.label}
              </span>
            ))}
          </div>

          <p className="text-gray-700 text-xl max-w-2xl mx-auto mb-12 font-medium">
            Transform AI-generated content into natural, human-like text that bypasses all detectors.
          </p>
          
          {/* CTA Button */}
          <button 
            onClick={() => document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-lg px-10 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all border-4 border-black mb-16"
          >
            Start Humanizing →
          </button>

          {/* App Preview Mockup */}
          <div className="max-w-5xl mx-auto mt-12">
            <div className="hand-drawn-border bg-white p-8 shadow-2xl relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Text Content */}
                <div className="text-left">
                  <p className="text-sm text-gray-600 font-semibold mb-3">Hi, welcome to NoteGlider</p>
                  <h2 className="text-4xl md:text-5xl font-black text-black leading-tight mb-4">
                    STUDY<br />
                    SMARTER<br />
                    WITH AI.
                  </h2>
                  <p className="text-gray-600 font-medium mb-6">
                    Transform your notes into flashcards, quizzes, and summaries with AI. Focus with ambient sounds and track your progress.
                  </p>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-black px-8 py-3 rounded-xl border-4 border-black shadow-lg transform hover:scale-105 transition-all">
                    Start Studying
                  </button>
                </div>

                {/* Right Side - App Mockup */}
                <div className="relative">
                  {/* Floating Icons */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-teal-400 rounded-full opacity-60 float-animation"></div>
                  <div className="absolute -top-2 left-20 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-2xl border-3 border-black shadow-lg">
                    🔒
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-2xl border-3 border-black shadow-lg">
                    ✨
                  </div>
                  <div className="absolute bottom-10 -right-8 w-16 h-16 bg-pink-400 rounded-full opacity-70 float-animation" style={{ animationDelay: '1s' }}></div>

                  {/* Main App Card */}
                  <div className="relative bg-gradient-to-br from-teal-400 to-teal-500 rounded-3xl border-4 border-black shadow-2xl p-8 overflow-hidden">
                    {/* App Header */}
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-black border-2 border-black shadow-md flex items-center gap-2">
                      😊 NoteGlider
                    </div>

                    {/* Content Area */}
                    <div className="mt-12 space-y-4">
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border-2 border-white/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-1 bg-white/60 rounded"></div>
                          <div className="w-4 h-4 bg-yellow-300 rounded-full border-2 border-black"></div>
                        </div>
                      </div>
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border-2 border-white/50">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-1 bg-white/60 rounded"></div>
                        </div>
                      </div>
                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border-2 border-white/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-1 bg-white/60 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Badge */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-6 py-2 rounded-full text-xs font-bold border-2 border-black shadow-lg">
                      ✨ Available for Students
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative circles outside the box */}
              <div className="absolute -left-8 top-1/4 w-16 h-16 border-4 border-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section id="tool-section" className="pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="hand-drawn-border bg-white shadow-2xl overflow-hidden">
            {/* Tool Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-4">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-44 border-2 border-black rounded-xl bg-white font-bold shadow-md">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black shadow-xl">
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value} disabled={t.isPremium && !hasAccess} className="bg-white hover:bg-yellow-50 font-semibold">
                        <span className="flex items-center gap-2">
                          {t.label}
                          {t.isPremium && !hasAccess && <Lock className="w-3 h-3 text-gray-400" />}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {uploadedFileName && (
                  <span className="text-sm text-gray-600 max-w-[150px] truncate font-medium" title={uploadedFileName}>📄 {uploadedFileName}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {isSignedIn && currentCredits !== undefined && (
                  <span className="text-sm font-bold text-gray-700 bg-yellow-100 px-3 py-1 rounded-full border-2 border-black">{currentCredits.toLocaleString()} credits</span>
                )}
                
                {humanizedText && !isHumanizing && (
                  <div className="flex items-center gap-2 pl-3 border-l-2 border-black">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="border-2 border-black bg-white hover:bg-yellow-50 font-bold">
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="border-2 border-black bg-white hover:bg-yellow-50 font-bold">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Text Areas */}
            <div className={cn("grid", showOutputPanel ? "md:grid-cols-2" : "grid-cols-1")}>
              {/* Input Panel */}
              <div
                className={cn(
                  "relative p-4 border-b-4 border-green-500 md:border-b-0 md:border-r-4 md:border-black",
                  isDragging && "bg-green-50"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste your AI-generated text here (minimum 50 words)..."
                  className="h-[500px] border-2 border-black rounded-xl resize-none focus-visible:ring-4 focus-visible:ring-green-300 text-base p-6 pb-16 w-full relative z-10 bg-white shadow-md transition-all font-medium"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                />
                
                {!originalText && !isDragging && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
                    style={{ zIndex: 20 }}
                  >
                    <div className="flex flex-col items-center gap-4 pointer-events-auto max-w-[200px]">
                      <div 
                        className="bg-green-400 p-8 rounded-full text-white hover:bg-green-500 transition-all cursor-pointer shadow-xl active:scale-95 border-4 border-black"
                        onClick={() => fileInputRef.current?.click()}
                      >
                         <UploadCloud className="w-12 h-12" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Upload document</p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">doc, docx, txt, pdf</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Panel */}
              {showOutputPanel && (
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col h-full border-t-4 border-green-500 md:border-t-0 p-4">
                  <div className="flex items-center justify-end gap-2 px-4 py-2 border-b-2 border-black md:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!humanizedText}
                      className="border-2 border-black bg-white hover:bg-yellow-50 font-bold"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex-1 bg-white border-2 border-black rounded-xl shadow-lg overflow-hidden relative">
                    <ScrollArea className="h-[500px] w-full">
                      <div className="p-6 pb-16">
                        {isHumanizing && humanizedText.length < 50 && thoughtsList.length > 0 ? (
                          <div className="flex items-center gap-3 text-gray-700 font-semibold">
                            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                            <span>{thoughtsList[0]}</span>
                          </div>
                        ) : (
                          <p className="text-base whitespace-pre-wrap font-medium text-gray-800">{humanizedText}</p>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Human Badge */}
                    {!isHumanizing && humanizedText && currentAiScore !== null && (
                      <div className="absolute bottom-4 right-4 z-20">
                        <div className="bg-green-400 text-black px-4 py-2 rounded-full text-sm font-black border-3 border-black shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <Check className="w-4 h-4" />
                          {currentAiScore}% Human ✨
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="px-6 py-4 border-t-4 border-black bg-gradient-to-r from-yellow-50 to-green-50 flex items-center justify-between">
              <span className="text-sm text-gray-700 font-bold">
                {wordCount} words · {charCount} chars
              </span>
              <Button
                onClick={isSignedIn ? handleHumanize : () => setShowSignInPrompt(true)}
                disabled={isHumanizing || !originalText.trim() || wordCount < 50}
                className="bg-green-500 hover:bg-green-600 text-white font-black text-lg px-10 py-3 rounded-full shadow-xl border-4 border-black transform hover:scale-105 transition-all"
              >
                {isHumanizing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Humanizing...
                  </>
                ) : (
                  "Humanize ✨"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Detectors Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm font-bold mb-8 uppercase tracking-wide">Bypass all major AI detectors</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {DETECTOR_NAMES.map((detector) => (
              <div key={detector.name} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100 transform hover:scale-110">
                <Image
                  src={detector.logo}
                  alt={detector.name}
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-sm font-bold text-gray-700">{detector.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ background: '#FFF9F0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center text-black mb-4">
            Why FilterNote?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg font-medium">Everything you need to humanize AI text</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "🎯 Undetectable", desc: "Passes Turnitin, GPTZero, and all major AI detectors with ease.", color: "bg-pink-100 border-pink-300" },
              { title: "✨ Natural Flow", desc: "Maintains your original meaning while adding human-like variations.", color: "bg-blue-100 border-blue-300" },
              { title: "⚡ Lightning Fast", desc: "Get results in seconds, not minutes. Stream output in real-time.", color: "bg-yellow-100 border-yellow-300" },
              { title: "🎨 Multiple Tones", desc: "Choose from Standard, Casual, Professional, Academic, or Creative.", color: "bg-green-100 border-green-300" },
              { title: "🔒 Secure & Private", desc: "Your content is never stored or used for training purposes.", color: "bg-purple-100 border-purple-300" },
              { title: "💰 Pay As You Go", desc: "Flexible credits system. Only pay for what you use.", color: "bg-orange-100 border-orange-300" },
            ].map((feature, i) => (
              <div key={i} className={`${feature.color} p-6 rounded-2xl border-4 border-black shadow-lg transform hover:scale-105 transition-all`}>
                <h3 className="font-black text-black mb-3 text-lg">{feature.title}</h3>
                <p className="text-gray-700 text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center text-black mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Paste Your Text", desc: "Copy and paste your AI-generated content into the editor.", emoji: "📝" },
              { step: "2", title: "Choose Your Tone", desc: "Select the writing style that matches your needs.", emoji: "🎨" },
              { step: "3", title: "Get Human Text", desc: "Receive naturally flowing text that bypasses AI detection.", emoji: "✨" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 border-4 border-black shadow-xl transform hover:rotate-12 transition-all">
                  {item.emoji}
                </div>
                <h3 className="font-black text-black mb-3 text-xl">{item.title}</h3>
                <p className="text-gray-600 text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20" style={{ background: '#FFF9F0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center text-black mb-4">Simple Pricing</h2>
          <p className="text-gray-600 text-center mb-12 text-lg font-medium">Choose the plan that works for you</p>
          <PolarPricing />
          <div className="mt-12">
            <TopUpSection />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center text-black mb-16">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "How does FilterNote work?", a: "FilterNote uses advanced AI to rewrite your text while preserving meaning, making it undetectable by AI detection tools.", emoji: "🤔" },
              { q: "Is my content safe?", a: "Yes. We don't store your content or use it for training. Your text is processed and immediately discarded.", emoji: "🔒" },
              { q: "What AI detectors does it bypass?", a: "FilterNote bypasses all major detectors including Turnitin, GPTZero, Copyleaks, ZeroGPT, Originality.ai, and more.", emoji: "✅" },
              { q: "How many words can I humanize?", a: "It depends on your plan. Free users get limited credits, while paid plans offer more generous allowances.", emoji: "📊" },
            ].map((faq, i) => (
              <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-4 border-black shadow-lg transform hover:scale-105 transition-all">
                <h3 className="font-black text-black mb-3 text-lg flex items-center gap-2">
                  <span className="text-2xl">{faq.emoji}</span>
                  {faq.q}
                </h3>
                <p className="text-gray-700 text-sm font-medium pl-10">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-black mb-4">Ready to humanize your content?</h2>
          <p className="text-gray-600 mb-8">Join thousands of users who trust FilterNote for undetectable AI content.</p>
          {isSignedIn ? (
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl"
            >
              Start Humanizing
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl">
                Get Started Free
              </Button>
            </SignInButton>
          )}
        </div>
      </section>

      <SiteFooter />

      {/* Sign In Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSignInPrompt(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-black mb-2">Sign in to continue</h3>
            <p className="text-gray-600 mb-6">Create a free account to start humanizing your content.</p>
            <SignInButton mode="modal">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-xl">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      )}
    </div>
  );
}
