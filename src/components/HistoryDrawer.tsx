"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Calendar, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

interface HistoryItem {
  id: string;
  originalText: string;
  humanizedText: string;
  preset: string;
  tokensUsed: number;
  aiScore: number | null;
  createdAt: Date;
}

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onDeleteItem?: (itemId: string) => void;
}

export default function HistoryDrawer({
  open,
  onOpenChange,
  history,
  onSelectItem,
  onDeleteItem,
}: HistoryDrawerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this history item?")) {
      return;
    }

    setDeletingId(itemId);
    try {
      const response = await fetch(`/api/humanizer/delete?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("History item deleted");
      onDeleteItem?.(itemId);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete history item");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl bg-white">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Humanization History</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <Calendar className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-lg font-medium text-slate-900">No history yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Your humanized texts will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4 px-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer mx-2"
                  onClick={() => {
                    onSelectItem(item);
                    onOpenChange(false);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.preset}
                      </Badge>
                      {item.aiScore !== null && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          {Math.round((1) * 100)}% Human
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Original</p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {item.originalText}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Humanized</p>
                      <p className="text-sm text-slate-900 line-clamp-2 font-medium">
                        {item.humanizedText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      {item.tokensUsed} credits used
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.humanizedText);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                        Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                      >
                        <Trash2 className="h-3 w-3" />
                        {deletingId === item.id ? "..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
