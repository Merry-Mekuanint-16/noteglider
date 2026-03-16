"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Loader2, Users, Plus, Trash2, UserPlus, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import PageNavbar from "~/components/PageNavbar";
import { SiteFooter } from "~/components/SiteFooter";

interface TeamMember { id: string; name: string; email: string; createdAt: Date; }
interface Team { id: string; name: string; ownerId: string; sharedCredits: number; owner?: { id: string; name: string; email: string; }; members: TeamMember[]; createdAt: Date; updatedAt: Date; }
interface TeamData { team: Team | null; ownedTeams: Team[]; canCreateTeam: boolean; subscriptionPlan: string | null; }

export default function TeamPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => { if (isLoaded && !isSignedIn) { router.push("/"); return; } if (isSignedIn) fetchTeamData(); }, [isSignedIn, isLoaded, router]);

  const fetchTeamData = async () => { try { const response = await fetch("/api/team"); if (response.ok) { const data = await response.json(); setTeamData(data); } else toast.error("Failed to load team data"); } catch { toast.error("Failed to load team data"); } finally { setLoading(false); } };
  const createTeam = async () => { if (!newTeamName.trim()) { toast.error("Please enter a team name"); return; } setActionLoading(true); try { const response = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newTeamName }) }); const data = await response.json(); if (response.ok) { toast.success("Team created!"); setNewTeamName(""); setShowCreateForm(false); await fetchTeamData(); } else toast.error(data.error || "Failed"); } catch { toast.error("Failed"); } finally { setActionLoading(false); } };
  const addMember = async (teamId: string) => { if (!memberEmail.trim()) { toast.error("Enter email"); return; } setActionLoading(true); try { const response = await fetch("/api/team/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId, memberEmail }) }); const data = await response.json(); if (response.ok) { toast.success("Member added!"); setMemberEmail(""); setSelectedTeamId(null); await fetchTeamData(); } else toast.error(data.error || "Failed"); } catch { toast.error("Failed"); } finally { setActionLoading(false); } };
  const removeMember = async (teamId: string, memberId: string) => { if (!confirm("Remove this member?")) return; setActionLoading(true); try { const response = await fetch(`/api/team/members?teamId=${teamId}&memberId=${memberId}`, { method: "DELETE" }); const data = await response.json(); if (response.ok) { toast.success("Removed!"); await fetchTeamData(); } else toast.error(data.error || "Failed"); } catch { toast.error("Failed"); } finally { setActionLoading(false); } };
  const deleteTeam = async (teamId: string) => { if (!confirm("Delete this team?")) return; setActionLoading(true); try { const response = await fetch(`/api/team?teamId=${teamId}`, { method: "DELETE" }); const data = await response.json(); if (response.ok) { toast.success("Deleted!"); await fetchTeamData(); } else toast.error(data.error || "Failed"); } catch { toast.error("Failed"); } finally { setActionLoading(false); } };

  if (loading || !isLoaded) return <div className="flex min-h-screen items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageNavbar />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8"><h1 className="text-3xl font-black text-gray-900">Team Management</h1><p className="mt-2 text-gray-500">Manage your team and collaborate on projects.</p></div>

          {!teamData?.canCreateTeam && (
            <div className="mb-8 rounded-xl border-2 border-green-200 bg-green-50 p-6">
              <div className="flex items-start gap-4"><Shield className="h-6 w-6 text-green-600" /><div><h3 className="font-bold text-gray-900">Upgrade to Ultra Plan</h3><p className="mt-1 text-sm text-gray-600">Team support is available for Ultra plan subscribers.</p><Button onClick={() => router.push("/pricing")} className="mt-4 rounded-full bg-green-500 text-white hover:bg-green-600">View Pricing</Button></div></div>
            </div>
          )}

          {teamData?.team && (
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">Your Team</h2><p className="text-sm text-gray-500">Team: {teamData.team.name}</p>
              <div className="mt-4"><h3 className="text-sm font-semibold text-gray-400">Team Owner</h3><div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-4"><div className="flex items-center gap-3"><Crown className="h-5 w-5 text-green-500" /><div><p className="font-medium text-gray-900">{teamData.team.owner?.name}</p><p className="text-sm text-gray-500">{teamData.team.owner?.email}</p></div></div></div></div>
            </div>
          )}

          {teamData?.ownedTeams && teamData.ownedTeams.length > 0 && (
            <div className="space-y-6">
              {teamData.ownedTeams.map((team) => (
                <div key={team.id} className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-900">{team.name}</h2><p className="text-sm text-gray-500">{team.members.length} members</p></div><Button variant="outline" size="sm" onClick={() => deleteTeam(team.id)} disabled={actionLoading} className="rounded-full border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button></div>
                  <div className="mt-6">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-400">Team Members</h3><Button size="sm" onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)} className="rounded-full bg-green-500 text-white hover:bg-green-600"><UserPlus className="h-4 w-4" /></Button></div>
                    {selectedTeamId === team.id && (<div className="mt-4 flex gap-2"><input type="email" placeholder="Enter member email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" /><Button onClick={() => addMember(team.id)} disabled={actionLoading} className="rounded-full bg-green-500 text-white hover:bg-green-600">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}</Button></div>)}
                    <div className="mt-4 space-y-2">
                      {team.members.length === 0 ? <p className="text-sm text-gray-400">No members yet.</p> : team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-gray-400" /><div><p className="font-medium text-gray-900">{member.name}</p><p className="text-sm text-gray-500">{member.email}</p></div></div><Button variant="outline" size="sm" onClick={() => removeMember(team.id, member.id)} disabled={actionLoading} className="rounded-full border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {teamData?.canCreateTeam && (
            <div className="mt-8">
              {!showCreateForm ? (
                <Button onClick={() => setShowCreateForm(true)} className="rounded-full bg-green-500 text-white hover:bg-green-600"><Plus className="h-5 w-5 mr-2" /> Create New Team</Button>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <h2 className="text-xl font-bold text-gray-900">Create New Team</h2>
                  <div className="mt-4 space-y-4"><div><label className="text-sm font-medium text-gray-600">Team Name</label><input type="text" placeholder="Enter team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="mt-2 w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" /></div><div className="flex gap-3"><Button onClick={createTeam} disabled={actionLoading} className="rounded-full bg-green-500 text-white hover:bg-green-600">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Team"}</Button><Button variant="outline" onClick={() => { setShowCreateForm(false); setNewTeamName(""); }} className="rounded-full border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</Button></div></div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
