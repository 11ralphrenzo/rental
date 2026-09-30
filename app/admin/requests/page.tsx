"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Wrench,
  CreditCard,
  HelpCircle,
  AlertCircle,
  MoreHorizontal,
  CheckCircle2,
  Eye,
  Clock,
  XCircle,
  ChevronDown,
  Send,
  Loader2,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { handleAxiosError } from "@/lib/utils";
import { GetAllRequests, UpdateRequest } from "@/services/admin-requests-service";
import { RenterRequest, RequestStatus, RequestType } from "@/models/request";

// ─── Config maps ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  RequestType,
  { label: string; icon: React.ReactNode; gradient: string; badge: string }
> = {
  early_payment: {
    label: "Early Payment",
    icon: <CreditCard className="w-4 h-4" />,
    gradient: "from-emerald-500 to-teal-600",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  maintenance: {
    label: "Maintenance",
    icon: <Wrench className="w-4 h-4" />,
    gradient: "from-amber-500 to-orange-600",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  inquiry: {
    label: "Inquiry",
    icon: <HelpCircle className="w-4 h-4" />,
    gradient: "from-blue-500 to-indigo-600",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  concern: {
    label: "Concern",
    icon: <AlertCircle className="w-4 h-4" />,
    gradient: "from-rose-500 to-pink-600",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
  other: {
    label: "Other",
    icon: <MoreHorizontal className="w-4 h-4" />,
    gradient: "from-violet-500 to-purple-600",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
};

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; icon: React.ReactNode; badge: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="w-3.5 h-3.5" />,
    badge: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  seen: {
    label: "Seen",
    icon: <Eye className="w-3.5 h-3.5" />,
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  resolved: {
    label: "Resolved",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  dismissed: {
    label: "Dismissed",
    icon: <XCircle className="w-3.5 h-3.5" />,
    badge: "bg-red-100 text-red-700 border-red-200",
  },
};

const STATUS_FILTERS: { value: "all" | RequestStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "seen", label: "Seen" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

function timeAgo(date: any): string {
  const d = date?.toDate ? date.toDate() : new Date(date?._seconds ? date._seconds * 1000 : date);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function RequestDetailPanel({
  request,
  onUpdate,
  onClose,
}: {
  request: RenterRequest;
  onUpdate: (updated: RenterRequest) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(request.adminNote || "");
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const typeConf = TYPE_CONFIG[request.type];
  const statusConf = STATUS_CONFIG[request.status];

  const handleStatusChange = async (status: RequestStatus) => {
    setStatusLoading(true);
    try {
      const res = await UpdateRequest({ id: request.id, status });
      onUpdate(res.data);
      toast.success(`Marked as ${STATUS_CONFIG[status].label}`);
    } catch (err) {
      handleAxiosError(err, "Failed to update status.");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    try {
      const res = await UpdateRequest({ id: request.id, adminNote: note });
      onUpdate(res.data);
      toast.success("Note saved.");
    } catch (err) {
      handleAxiosError(err, "Failed to save note.");
    } finally {
      setSaving(false);
    }
  };

  // Mark as seen when panel opens if still pending
  useEffect(() => {
    if (request.status === "pending") {
      UpdateRequest({ id: request.id, status: "seen" })
        .then((res) => onUpdate(res.data))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeConf.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
          >
            {typeConf.icon}
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-sm leading-tight">{request.subject}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {request.renterName} · {timeAgo(request.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors flex-shrink-0"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeConf.badge}`}
          >
            {typeConf.icon}
            {typeConf.label}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConf.badge}`}
          >
            {statusConf.icon}
            {statusConf.label}
          </span>
        </div>

        {/* Message */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Message
          </p>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {request.message}
          </p>
        </div>

        {/* Status actions */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Update Status
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["seen", "resolved", "dismissed"] as RequestStatus[]).map((s) => {
              const conf = STATUS_CONFIG[s];
              const isActive = request.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={isActive || statusLoading}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                    ${isActive
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    } disabled:opacity-60`}
                >
                  {statusLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    conf.icon
                  )}
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin note */}
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Your Note / Reply
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write a note or reply for this request..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-400">{note.length}/500</span>
            <button
              onClick={handleSaveNote}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RenterRequest[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | RequestType>("all");
  const [selected, setSelected] = useState<RenterRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAllRequests();
      setRequests(res.data);
    } catch (err) {
      handleAxiosError(err, "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdate = (updated: RenterRequest) => {
    setRequests((prev) =>
      prev?.map((r) => (r.id === updated.id ? updated : r))
    );
    if (selected?.id === updated.id) setSelected(updated);
  };

  const filtered = requests?.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    return true;
  });

  const pendingCount = requests?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)] overflow-hidden">
      {/* ── Left: List ──────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          selected ? "w-full lg:w-[55%]" : "w-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black text-zinc-900 tracking-tight">
                Renter Requests
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {requests?.length ?? "—"} total
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 text-white text-[10px] font-bold rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {pendingCount} new
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* Status pills */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-full border border-zinc-200/50 flex-shrink-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  filter === f.value
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {f.label}
                {f.value === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 bg-zinc-900 text-white text-[10px] font-bold rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type select */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | RequestType)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-zinc-200 rounded-full text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading && !requests && (
            <div className="flex items-center justify-center py-16 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Loading requests...</span>
            </div>
          )}

          {!loading && filtered?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-300">
              <Inbox className="w-10 h-10 mb-3" />
              <p className="text-sm font-semibold text-zinc-400">No requests found</p>
              <p className="text-xs text-zinc-400 mt-1">Adjust your filters or check back later.</p>
            </div>
          )}

          {filtered?.map((req) => {
            const typeConf = TYPE_CONFIG[req.type];
            const statusConf = STATUS_CONFIG[req.status];
            const isSelected = selected?.id === req.id;

            return (
              <button
                key={req.id}
                onClick={() => setSelected(isSelected ? null : req)}
                className={`w-full text-left flex items-start gap-3.5 p-4 rounded-2xl border transition-all group
                  ${isSelected
                    ? "bg-zinc-900 border-zinc-900 shadow-lg"
                    : req.status === "pending"
                    ? "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                    : "bg-white/70 border-zinc-100 hover:bg-white hover:border-zinc-200"
                  }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${typeConf.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
                >
                  {typeConf.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p
                      className={`text-sm font-bold truncate ${
                        isSelected ? "text-white" : "text-zinc-900"
                      }`}
                    >
                      {req.subject}
                    </p>
                    <span
                      className={`text-[10px] font-medium flex-shrink-0 ${
                        isSelected ? "text-zinc-400" : "text-zinc-400"
                      }`}
                    >
                      {timeAgo(req.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate mb-2 ${
                      isSelected ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {req.renterName} · {req.message}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isSelected
                          ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                          : statusConf.badge
                      }`}
                    >
                      {statusConf.icon}
                      {statusConf.label}
                    </span>
                    {req.status === "pending" && !isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Detail Panel ──────────────────────────────────────────────── */}
      {selected && (
        <div className="hidden lg:flex flex-col w-[45%] bg-white border border-zinc-100 rounded-3xl shadow-sm overflow-hidden flex-shrink-0">
          <RequestDetailPanel
            request={selected}
            onUpdate={handleUpdate}
            onClose={() => setSelected(null)}
          />
        </div>
      )}

      {/* Mobile: bottom sheet style panel */}
      {selected && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-[0_-8px_40px_-4px_rgba(0,0,0,0.15)] border-t border-zinc-100 max-h-[80vh] overflow-hidden">
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mt-3 mb-1" />
          <RequestDetailPanel
            request={selected}
            onUpdate={handleUpdate}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
