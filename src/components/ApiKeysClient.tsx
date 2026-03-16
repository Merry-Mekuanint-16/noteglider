"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Key, Plus, Trash2, Eye, EyeOff, Copy, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ApiKey { id: string; name: string; key: string; createdAt: Date; lastUsed: Date | null; }
interface ApiKeysClientProps { initialApiKeys: ApiKey[]; hasApiAccess: boolean; }

export default function ApiKeysClient({ initialApiKeys, hasApiAccess }: ApiKeysClientProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  if (!hasApiAccess) {
    return (
      <div>
        <div className="mb-8"><h1 className="text-3xl font-black text-gray-900">API Access</h1><p className="mt-2 text-gray-500">Integrate FilterNote into your applications</p></div>
        <Card className="border-green-200 bg-green-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900"><AlertCircle className="h-5 w-5 text-green-600" />API Access Requires ULTRA Plan</CardTitle><CardDescription className="text-gray-600">Upgrade to access our API.</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-white p-4 border border-gray-200"><h3 className="font-semibold text-gray-900 mb-2">With API access, you can:</h3><ul className="space-y-2 text-sm text-gray-600"><li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /><span>Integrate AI humanization into your apps</span></li><li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /><span>Automate text processing workflows</span></li><li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5" /><span>Build custom solutions</span></li></ul></div>
            <div className="flex gap-3"><Link href="/pricing"><Button className="bg-green-500 text-white hover:bg-green-600">View Pricing</Button></Link><Link href="/contact"><Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50">Contact Sales</Button></Link></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) { toast.error("Enter a name"); return; }
    setCreating(true);
    try {
      const response = await fetch("/api/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newKeyName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed");
      setApiKeys([data.apiKey, ...apiKeys]);
      setNewKeyName("");
      setShowKeys({ ...showKeys, [data.apiKey.id]: true });
      toast.success("API key created! Copy it now - it won't be shown again.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Failed"); } finally { setCreating(false); }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm("Delete this API key?")) return;
    try {
      const response = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed");
      setApiKeys(apiKeys.filter(k => k.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed"); }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };
  const toggleKeyVisibility = (id: string) => { setShowKeys({ ...showKeys, [id]: !showKeys[id] }); };
  const maskApiKey = (key: string) => `${key.slice(0, 8)}${"•".repeat(24)}${key.slice(-4)}`;

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-black text-gray-900">API Keys</h1><p className="mt-2 text-gray-500">Manage your API keys for FilterNote integration</p></div>
      <Card className="mb-8 border-gray-200 bg-white">
        <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900"><Plus className="h-5 w-5 text-green-500" />Create New API Key</CardTitle><CardDescription className="text-gray-500">Generate a new API key</CardDescription></CardHeader>
        <CardContent><div className="flex gap-3"><div className="flex-1"><Label htmlFor="keyName" className="sr-only">API Key Name</Label><Input id="keyName" placeholder="e.g., Production Server" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createApiKey()} className="border-gray-200 bg-gray-50" /></div><Button onClick={createApiKey} disabled={creating || !newKeyName.trim()} className="bg-green-500 text-white hover:bg-green-600">{creating ? "Creating..." : "Create Key"}</Button></div></CardContent>
      </Card>
      <Card className="border-gray-200 bg-white">
        <CardHeader><CardTitle className="flex items-center gap-2 text-gray-900"><Key className="h-5 w-5 text-green-500" />Your API Keys</CardTitle><CardDescription className="text-gray-500">{apiKeys.length === 0 ? "No API keys yet" : `${apiKeys.length} key${apiKeys.length !== 1 ? "s" : ""}`}</CardDescription></CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? <p className="text-center py-8 text-gray-400">Create your first API key above</p> : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between"><span className="font-medium text-gray-900">{apiKey.name}</span><Button size="sm" variant="outline" onClick={() => deleteApiKey(apiKey.id)} className="border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button></div>
                  <div className="mt-2 flex items-center gap-2"><code className="flex-1 rounded bg-white px-3 py-2 text-sm font-mono text-gray-600 border border-gray-200">{showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}</code><Button size="sm" variant="outline" onClick={() => toggleKeyVisibility(apiKey.id)} className="border-gray-200">{showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button size="sm" variant="outline" onClick={() => copyToClipboard(apiKey.key)} className="border-gray-200"><Copy className="h-4 w-4" /></Button></div>
                  <p className="mt-2 text-xs text-gray-400">Created: {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-8 border-gray-200 bg-white">
        <CardHeader><CardTitle className="text-gray-900">API Documentation</CardTitle><CardDescription className="text-gray-500">How to use the FilterNote API</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><h3 className="font-semibold text-gray-900 mb-2">Base URL</h3><code className="block rounded bg-gray-50 px-3 py-2 text-sm text-gray-600 border border-gray-200">https://filternote.com/api</code></div>
          <div><h3 className="font-semibold text-gray-900 mb-2">Authentication</h3><p className="text-sm text-gray-600 mb-2">Include your API key in headers:</p><code className="block rounded bg-gray-50 px-3 py-2 text-sm text-gray-600 border border-gray-200">Authorization: Bearer YOUR_API_KEY</code></div>
          <div><h3 className="font-semibold text-gray-900 mb-2">Example</h3><pre className="rounded bg-gray-50 px-3 py-2 text-xs overflow-x-auto text-gray-600 border border-gray-200">{`curl -X POST https://filternote.com/api/humanizer \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your text here", "preset": "default"}'`}</pre></div>
        </CardContent>
      </Card>
    </div>
  );
}
