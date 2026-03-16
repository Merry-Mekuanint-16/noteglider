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

const TONES = [
  { value: "default", label: "Standard", isPremium: false },
  { value: "casual", label: "Casual", isPremium: false },
  { value: "professional", label: "Professional", isPremium: true },
  { value: "academic", label: "Academic", isPremium: true },
  { value: "creative", label: "Creative", isPremium: true },
  { value: "formal", label: "Formal", isPremium: true },
  { value: "friendly", label: "Friendly", isPremium: true },
  { value: "persuasive", label: "Persuasive", isPremium: true },
];

const HUMANIZING_PROCESSES = [
  "Analyzing text structure",
  "Identifying AI patterns",
  "Reviewing sentence flow",
  "Optimizing vocabulary",
  "Finalizing output",
];

const DETECTOR_NAMES = [
  { name: "Turnitin", logo: "/logo/turnitin.png" },
  { name: "GPTZero", logo: "/logo/GPTZero.png" },
  { name: "Copyleaks", logo: "/logo/copyleaks.png" },
  { name: "ZeroGPT", logo: "/logo/zeroGPT.png" },
  { name: "Originality.ai", logo: "/logo/originality.png" },
  { name: "Sapling", logo: "/logo/sapling.png" },
  { name: "Writer", logo: "/logo/writer.png" },
  { name: "Quillbot", logo: "/logo/quillbot.png" },
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
  const [humanizedText, setHumanizedText] = useState("");
  const [tone, setTone] = useState("default");
  const [isHumanizing, setIsHumanizing] = useState(false);
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
    if (!isHumanizing) return;
    setThoughtsList([HUMANIZING_PROCESSES[0] || ""]);
    const scheduleNext = () => {
      const randomDelay = Math.floor(Math.random() * 2000) + 1500;
      processTimeoutRef.current = setTimeout(() => {
        setThoughtsList(prev => {
          const idx = HUMANIZING_PROCESSES.indexOf(prev[0] || "");
          const nextIdx = (idx + 1) % HUMANIZING_PROCESSES.length;
          return [HUMANIZING_PROCESSES[nextIdx] || ""];
        });
        scheduleNext();
      }, randomDelay);
    };
    scheduleNext();
    return () => { if (processTimeoutRef.current) clearTimeout(processTimeoutRef.current); };
  }, [isHumanizing]);

  useEffect(() => {
    if (humanizedText.length >= 50) {
      setThoughtsList([]);
      if (processTimeoutRef.current) clearTimeout(processTimeoutRef.current);
    }
  }, [humanizedText.length]);

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
    <div className="min-h-screen bg-white">
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

      {/* Hero Section with Grid Background */}
      <section 
        className="relative pt-20 pb-6 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e8e8e8 1px, transparent 1px),
            linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center relative">
          {/* Floating Pills - Positioned around headline */}
          <div className="relative py-8">
            {/* Top Left - Students */}
            <span 
              className="absolute px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg hidden md:block"
              style={{ top: '0px', left: '5%', transform: 'rotate(-12deg)' }}
            >
              Students
            </span>
            
            {/* Top Right - Writers */}
            <span 
              className="absolute px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg hidden md:block"
              style={{ top: '10px', right: '8%', transform: 'rotate(8deg)' }}
            >
              Writers
            </span>
            
            {/* Bottom Left - Researchers */}
            <span 
              className="absolute px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg hidden md:block"
              style={{ bottom: '0px', left: '10%', transform: 'rotate(-6deg)' }}
            >
              Researchers
            </span>
            
            {/* Bottom Right - Marketers */}
            <span 
              className="absolute px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-semibold shadow-lg hidden md:block"
              style={{ bottom: '10px', right: '5%', transform: 'rotate(10deg)' }}
            >
              Marketers
            </span>

            {/* Horizontal Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-black mb-4">
              Make AI sound human.
            </h1>
          </div>
          
          {/* Mobile Pills - Show in a row on mobile */}
          <div className="flex flex-wrap justify-center gap-2 mb-4 md:hidden">
            {["Students", "Writers", "Researchers", "Marketers"].map((pill) => (
              <span
                key={pill}
                className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold"
              >
                {pill}
              </span>
            ))}
          </div>

          <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">
            Transform AI-generated content into natural, human-like text that bypasses detection.
          </p>
        </div>
      </section>

      {/* Tool Section - Shifted Up */}
      <section className="pb-8 -mt-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Tool Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-4">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-44 border-gray-200 rounded-lg bg-white">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value} disabled={t.isPremium && !hasAccess} className="bg-white hover:bg-gray-50">
                        <span className="flex items-center gap-2">
                          {t.label}
                          {t.isPremium && !hasAccess && <Lock className="w-3 h-3 text-gray-400" />}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {uploadedFileName && (
                  <span className="text-sm text-gray-500 max-w-[150px] truncate" title={uploadedFileName}>📄 {uploadedFileName}</span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {isSignedIn && currentCredits !== undefined && (
                  <span className="text-sm text-gray-500 mr-2">{currentCredits.toLocaleString()} credits</span>
                )}
                
                {/* Output Controls inside Header */}
                {humanizedText && !isHumanizing && (
                  <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleCopy} className="border-gray-200 bg-white">
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="border-gray-200 bg-white">
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
                  "relative p-3 border-b-2 border-green-500/30 md:border-b-0 md:border-r md:border-gray-100",
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
                  className="h-[500px] border border-gray-200 rounded-xl resize-none focus-visible:ring-2 focus-visible:ring-green-500/30 text-base p-6 pb-16 w-full relative z-10 bg-white shadow-sm transition-all"
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
                        className="bg-green-50 p-6 rounded-full text-green-500 hover:bg-green-100 transition-all cursor-pointer shadow-sm active:scale-95"
                        onClick={() => fileInputRef.current?.click()}
                      >
                         <UploadCloud className="w-12 h-12" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Upload document</p>
                        <p className="text-xs text-gray-500 mt-1">doc, docx, txt, pdf</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Output Panel */}
              {showOutputPanel && (
                <div className="relative bg-gray-50 flex flex-col h-full border-t-2 border-green-500/30 md:border-t-0 p-3">
                  <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-gray-100 md:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!humanizedText}
                      className="border-gray-200 bg-white"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">
                    <ScrollArea className="h-[500px] w-full">
                      <div className="p-6 pb-16">
                        {isHumanizing && humanizedText.length < 50 && thoughtsList.length > 0 ? (
                          <div className="flex items-center gap-3 text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                            <span>{thoughtsList[0]}</span>
                          </div>
                        ) : (
                          <p className="text-base whitespace-pre-wrap">{humanizedText}</p>
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Human Badge */}
                    {!isHumanizing && humanizedText && currentAiScore !== null && (
                      <div className="absolute bottom-4 right-4 z-20">
                        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200 shadow-sm flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <Check className="w-3.5 h-3.5" />
                          {currentAiScore}% Human
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar - Word count and Humanize button on same line */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {wordCount} words · {charCount} chars
              </span>
              <Button
                onClick={isSignedIn ? handleHumanize : () => setShowSignInPrompt(true)}
                disabled={isHumanizing || !originalText.trim() || wordCount < 50}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-2.5 rounded-xl"
              >
                {isHumanizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Humanizing...
                  </>
                ) : (
                  "Humanize"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Detectors Section - Below Tool */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-6">Bypass all major AI detectors</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {DETECTOR_NAMES.map((detector) => (
              <div key={detector.name} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
                <Image
                  src={detector.logo}
                  alt={detector.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <span className="text-sm font-medium text-gray-600">{detector.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e8e8e8 1px, transparent 1px),
            linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-black mb-12">Why FilterNote?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Undetectable", desc: "Passes Turnitin, GPTZero, and all major AI detectors with ease." },
              { title: "Natural Flow", desc: "Maintains your original meaning while adding human-like variations." },
              { title: "Lightning Fast", desc: "Get results in seconds, not minutes. Stream output in real-time." },
              { title: "Multiple Tones", desc: "Choose from Standard, Casual, Professional, Academic, or Creative." },
              { title: "Secure & Private", desc: "Your content is never stored or used for training purposes." },
              { title: "Pay As You Go", desc: "Flexible credits system. Only pay for what you use." },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-black mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Paste Your Text", desc: "Copy and paste your AI-generated content into the editor." },
              { step: "2", title: "Choose Your Tone", desc: "Select the writing style that matches your needs." },
              { step: "3", title: "Get Human Text", desc: "Receive naturally flowing text that bypasses AI detection." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-black mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-black mb-4">Simple Pricing</h2>
          <p className="text-gray-600 text-center mb-12">Choose the plan that works for you</p>
          <PolarPricing />
          <div className="mt-12">
            <TopUpSection />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        className="py-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e8e8e8 1px, transparent 1px),
            linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center text-black mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How does FilterNote work?", a: "FilterNote uses advanced AI to rewrite your text while preserving meaning, making it undetectable by AI detection tools." },
              { q: "Is my content safe?", a: "Yes. We don't store your content or use it for training. Your text is processed and immediately discarded." },
              { q: "What AI detectors does it bypass?", a: "FilterNote bypasses all major detectors including Turnitin, GPTZero, Copyleaks, ZeroGPT, Originality.ai, and more." },
              { q: "How many words can I humanize?", a: "It depends on your plan. Free users get limited credits, while paid plans offer more generous allowances." },
            ].map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-black mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
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
