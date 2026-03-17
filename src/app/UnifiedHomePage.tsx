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

    setIsProcessing(true);
    setGeneratedContent("");
    setThoughtsList([]);
    setCurrentAiScore(null);

    try {
      const response = await fetch("/api/humanizer/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, preset: studyMode, tone: studyMode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to generate");
        setIsProcessing(false);
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
              setIsProcessing(false);
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
                setGeneratedContent(accumulatedText);
              }
            }
          } catch {}
        }
      }

      if (!streamCompleted && accumulatedText.length > 0) {
        setIsProcessing(false);
        setCurrentAiScore(100);
      }
    } catch {
      toast.error("Failed to generate content");
      setIsProcessing(false);
    }
  }, [originalText, isSignedIn, currentCredits, studyMode, fetchCredits, fetchHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && originalText.trim() && !isProcessing && isSignedIn) {
        e.preventDefault();
        void handleHumanize();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [originalText, isProcessing, isSignedIn, handleHumanize]);

  const handleCopy = async () => {
    if (!generatedContent) return;
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/plain;charset=utf-8" });
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
  const handleHistorySelect = (item: HistoryItem) => { setOriginalText(item.originalText); setGeneratedContent(item.humanizedText); setStudyMode(item.preset); };

  const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = originalText.length;
  const showOutputPanel = isProcessing || Boolean(generatedContent);
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

      {/* Hero Section - Exact Match to Design */}
      <section className="relative py-12 overflow-hidden">
        {/* Decorative circles - exact positions */}
        <div className="absolute top-12 left-12 w-20 h-20 bg-teal-400 rounded-full opacity-90"></div>
        <div className="absolute top-40 left-8 w-16 h-16 border-4 border-red-400 rounded-full opacity-70"></div>
        <div className="absolute bottom-24 right-24 w-20 h-20 bg-purple-300 rounded-full opacity-80"></div>
        <div className="absolute bottom-32 right-20 w-16 h-16 bg-yellow-300 rounded-full opacity-90"></div>
        <div className="absolute bottom-12 right-12 w-24 h-24 bg-pink-400 rounded-full opacity-80"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="hand-drawn-border bg-white p-10 md:p-16 shadow-2xl relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content (exact match) */}
              <div>
                <p className="text-sm text-gray-600 mb-6 font-medium">Hi, welcome to NoteGlider</p>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black leading-tight mb-6">
                  STUDY<br />
                  SMARTER<br />
                  WITH AI.
                </h1>
                
                <p className="text-gray-700 text-base md:text-lg mb-8 font-normal max-w-md leading-relaxed">
                  Transform your notes into flashcards, quizzes, and summaries with AI. Focus with ambient sounds and track your progress.
                </p>
                
                <button 
                  onClick={() => document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-base px-8 py-3.5 rounded-2xl shadow-lg transform hover:scale-105 transition-all border-4 border-black"
                >
                  Start Studying
                </button>
              </div>
              
              {/* Right side - Illustration (exact match) */}
              <div className="relative">
                {/* Lock icon - top left */}
                <div className="absolute -top-4 left-8 w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center border-4 border-black shadow-lg z-10">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                
                {/* Main card illustration */}
                <div className="bg-teal-400 rounded-3xl p-10 border-4 border-black shadow-2xl mt-8 relative">
                  {/* NoteGlider badge - top right */}
                  <div className="absolute -top-3 right-6 bg-yellow-400 px-4 py-2 rounded-full border-4 border-black shadow-lg flex items-center gap-1.5">
                    <span className="text-lg">📚</span>
                    <span className="font-black text-sm">NoteGlider</span>
                  </div>
                  
                  {/* Note lines illustration */}
                  <div className="space-y-5 mb-10 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-3 bg-teal-300 rounded-full"></div>
                      <div className="w-8 h-8 bg-yellow-300 rounded-lg border-2 border-black flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">✓</span>
                      </div>
                    </div>
                    <div className="w-3/4 h-3 bg-teal-300 rounded-full"></div>
                    <div className="w-full h-3 bg-teal-300 rounded-full"></div>
                  </div>
                  
                  {/* Bottom badge */}
                  <div className="bg-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold inline-flex items-center gap-2 border-2 border-black">
                    <span>✨</span>
                    <span>Available for Students</span>
                  </div>
                </div>
                
                {/* Decorative dots - bottom right */}
                <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-yellow-300 rounded-full border-4 border-black flex items-center justify-center shadow-lg">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
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
                <Select value={studyMode} onValueChange={setStudyMode}>
                  <SelectTrigger className="w-44 border-2 border-black rounded-xl bg-white font-bold shadow-md">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black shadow-xl">
                    {STUDY_MODES.map((t) => (
                      <SelectItem key={t.value} value={t.value} disabled={t.isPremium && !hasAccess} className="bg-white hover:bg-yellow-50 font-semibold">
                        <span className="flex items-center gap-2">
                          {t.icon} {t.label}
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
                
                {generatedContent && !isProcessing && (
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
                      disabled={!generatedContent}
                      className="border-2 border-black bg-white hover:bg-yellow-50 font-bold"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex-1 bg-white border-2 border-black rounded-xl shadow-lg overflow-hidden relative">
                    <ScrollArea className="h-[500px] w-full">
                      <div className="p-6 pb-16">
                        {isProcessing && generatedContent.length < 50 && thoughtsList.length > 0 ? (
                          <div className="flex items-center gap-3 text-gray-700 font-semibold">
                            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                            <span>{thoughtsList[0]}</span>
                          </div>
                        ) : (
                          <p className="text-base whitespace-pre-wrap font-medium text-gray-800">{generatedContent}</p>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Success Badge */}
                    {!isProcessing && generatedContent && currentAiScore !== null && (
                      <div className="absolute bottom-4 right-4 z-20">
                        <div className="bg-green-400 text-black px-4 py-2 rounded-full text-sm font-black border-3 border-black shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <Check className="w-4 h-4" />
                          Complete ✨
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
                disabled={isProcessing || !originalText.trim() || wordCount < 50}
                className="bg-green-500 hover:bg-green-600 text-white font-black text-lg px-10 py-3 rounded-full shadow-xl border-4 border-black transform hover:scale-105 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Generate ✨"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Study Modes Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm font-bold mb-8 uppercase tracking-wide">All your study needs in one place</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {[
              { name: "Summary", icon: "📝" },
              { name: "Flashcards", icon: "🎴" },
              { name: "Quiz", icon: "❓" },
              { name: "Audio Learning", icon: "🎧" }
            ].map((mode) => (
              <div key={mode.name} className="flex items-center gap-3 transform hover:scale-110 transition-all">
                <span className="text-3xl">{mode.icon}</span>
                <span className="text-base font-bold text-gray-700">{mode.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" style={{ background: '#FFF9F0' }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-black text-center text-black mb-4">
            Why NoteGlider?
          </h2>
          <p className="text-center text-gray-600 mb-12 text-lg font-medium">Everything you need to ace your studies</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "📝 Smart Summaries", desc: "Get concise summaries of your notes instantly with AI-powered analysis.", color: "bg-pink-100 border-pink-300" },
              { title: "🎴 Auto Flashcards", desc: "Generate flashcards automatically from your notes for effective memorization.", color: "bg-blue-100 border-blue-300" },
              { title: "❓ Practice Quizzes", desc: "Test your knowledge with AI-generated quizzes based on your content.", color: "bg-yellow-100 border-yellow-300" },
              { title: "🎧 Audio Learning", desc: "Listen to your notes with text-to-speech for learning on the go.", color: "bg-green-100 border-green-300" },
              { title: "📊 Track Progress", desc: "Monitor your study sessions and see your improvement over time.", color: "bg-purple-100 border-purple-300" },
              { title: "🔒 Private & Secure", desc: "Your notes are encrypted and never shared. Complete privacy guaranteed.", color: "bg-orange-100 border-orange-300" },
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
              { step: "1", title: "Upload Your Notes", desc: "Paste or upload your study notes, lecture transcripts, or textbook content.", emoji: "📤" },
              { step: "2", title: "Choose Study Mode", desc: "Select what you need: summaries, flashcards, quizzes, or audio.", emoji: "🎯" },
              { step: "3", title: "Start Learning", desc: "Get AI-generated study materials instantly and ace your exams.", emoji: "🎓" },
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
              { q: "How does NoteGlider work?", a: "NoteGlider uses AI to analyze your notes and generate study materials like summaries, flashcards, and quizzes automatically.", emoji: "🤔" },
              { q: "Is my data safe?", a: "Yes! Your notes are encrypted and stored securely. We never share your data with third parties.", emoji: "🔒" },
              { q: "What formats can I upload?", a: "You can upload text, PDF, Word documents, or paste content directly into the editor.", emoji: "📄" },
              { q: "How much does it cost?", a: "We offer a free tier with limited credits. Paid plans start at just $5/month for unlimited access.", emoji: "💰" },
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
