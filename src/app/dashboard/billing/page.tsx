"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { AlertCircle, ArrowUpDown, BookOpen, CalendarDays, CheckCircle2, Clock, CreditCard, FileText, RefreshCw, Search } from "lucide-react";
import { useGetPaymentsByUserIdQuery } from "@/Redux/api/billingApi";
import { RootState } from "@/Redux/store";
import InvoiceBreakdown from "@/components/dashboard/InvoiceBreakdown";
import { DashboardPageHeader } from "../DashboardClientLayout";
import { Badge, Button, CountUp, EmptyState, ErrorState, IconTile, Input, Skeleton, Stagger, StaggerItem, Tabs, cn, inputClass } from "@/ui";

type Payment = {
  id: string;
  userId: string;
  enrollmentId: string;
  amount: string;
  status: "pending" | "paid" | "failed";
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
};

type BillingHistoryItem = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  invoiceUrl?: string;
  razorpay_order_id: string;
  timestamp: string;
  numericAmount: number;
};

type SortOption = "newest" | "oldest" | "amount-high" | "amount-low";

const toTime = (value: string) => {
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export default function PaymentHistoryPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const { data: payments, error, isLoading, isFetching, refetch } = useGetPaymentsByUserIdQuery(
    userId,
    { skip: !userId }
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedInvoice, setSelectedInvoice] = useState<BillingHistoryItem | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  // Stable reference so the modal's focus handling doesn't re-run on every render
  const closeInvoice = useCallback(() => setInvoiceOpen(false), []);
  const openInvoice = (item: BillingHistoryItem) => {
    setSelectedInvoice(item);
    setInvoiceOpen(true);
  };

  // Format payment data for billing history
  const formatBillingHistory = (list: Payment[]): BillingHistoryItem[] => {
    if (!Array.isArray(list)) return [];

    return list.map((payment) => {
      const numericAmount = parseFloat(payment.amount);
      const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;
      const created = new Date(payment.createdAt);
      return {
        id: payment.id,
        date: Number.isNaN(created.getTime())
          ? "—"
          : created.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
        timestamp: payment.createdAt,
        amount: `₹${safeAmount.toLocaleString("en-IN")}`,
        numericAmount: safeAmount,
        status:
          payment.status === "paid" ? "Paid" : payment.status === "failed" ? "Failed" : "Pending",
        razorpay_order_id: payment.razorpay_order_id || "—",
        invoiceUrl: payment.status === "paid" ? "#" : undefined,
      };
    });
  };

  // Filter and sort payments
  const filteredAndSortedPayments = (list: BillingHistoryItem[]) => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = list.filter((payment) => {
      const matchesSearch =
        !term ||
        payment.razorpay_order_id.toLowerCase().includes(term) ||
        payment.amount.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => toTime(b.timestamp) - toTime(a.timestamp));
        break;
      case "oldest":
        filtered.sort((a, b) => toTime(a.timestamp) - toTime(b.timestamp));
        break;
      case "amount-high":
        filtered.sort((a, b) => b.numericAmount - a.numericAmount);
        break;
      case "amount-low":
        filtered.sort((a, b) => a.numericAmount - b.numericAmount);
        break;
    }

    return filtered;
  };

  const billingHistory = Array.isArray(payments) ? formatBillingHistory(payments) : [];
  const displayPayments = filteredAndSortedPayments(billingHistory);

  // Statistics
  const totalPaid = billingHistory.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.numericAmount, 0);
  const paidCount = billingHistory.filter((p) => p.status === "Paid").length;
  const pendingCount = billingHistory.filter((p) => p.status === "Pending").length;
  const failedCount = billingHistory.filter((p) => p.status === "Failed").length;

  const header = (showRefresh: boolean) => (
    <DashboardPageHeader
      title="Billing"
      subtitle="Your payments and invoices."
      action={
        showRefresh ? (
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} aria-hidden />
            Refresh
          </Button>
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <div>
        {header(false)}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 rounded-2xl border border-line" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 rounded-2xl border border-line" />
      </div>
    );
  }

  // A 404 from the payments endpoint means the user has no payments yet
  const isNotFound = !!error && typeof error === "object" && "status" in error && error.status === 404;

  if (error && !isNotFound) {
    return (
      <div>
        {header(false)}
        <ErrorState title="We couldn't load your payments" onRetry={() => refetch()} retrying={isFetching} />
      </div>
    );
  }

  const statCards = [
    { label: "Total paid", value: `₹${totalPaid.toLocaleString("en-IN")}`, icon: CheckCircle2, tile: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    { label: "Pending", value: pendingCount.toString(), icon: Clock, tile: "bg-amber-50 text-amber-600 ring-amber-100" },
    { label: "Failed", value: failedCount.toString(), icon: AlertCircle, tile: "bg-red-50 text-red-600 ring-red-100" },
  ];

  const statusTabs: { id: string; label: ReactNode }[] = [
    { id: "all", label: <>All <span className="opacity-60">{billingHistory.length}</span></> },
    { id: "paid", label: <>Paid <span className="opacity-60">{paidCount}</span></> },
    { id: "pending", label: <>Pending <span className="opacity-60">{pendingCount}</span></> },
    { id: "failed", label: <>Failed <span className="opacity-60">{failedCount}</span></> },
  ];

  const statusBadge = (status: BillingHistoryItem["status"]) =>
    status === "Paid" ? (
      <Badge tone="success">
        <CheckCircle2 className="h-3 w-3" aria-hidden />
        Paid
      </Badge>
    ) : status === "Failed" ? (
      <Badge tone="danger">
        <AlertCircle className="h-3 w-3" aria-hidden />
        Failed
      </Badge>
    ) : (
      <Badge tone="warning">
        <Clock className="h-3 w-3" aria-hidden />
        Pending
      </Badge>
    );

  const invoiceButton = (payment: BillingHistoryItem, full = false) =>
    payment.invoiceUrl ? (
      <Button variant="outline" size="sm" onClick={() => openInvoice(payment)} className={full ? "w-full" : undefined}>
        <FileText className="h-4 w-4" aria-hidden />
        Invoice
      </Button>
    ) : (
      <span className="text-sm text-ink-3">—</span>
    );

  const hasFilters = !!searchTerm.trim() || statusFilter !== "all";

  return (
    <div className="space-y-6">
      {header(true)}

      {/* Stats */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((stat) => (
          <StaggerItem key={stat.label}>
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-soft)]">
              <IconTile className={stat.tile}>
                <stat.icon className="h-5 w-5" aria-hidden />
              </IconTile>
              <div>
                <CountUp value={stat.value} className="block text-2xl font-semibold tracking-tight text-ink" />
                <p className="text-sm text-ink-3">{stat.label}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs tabs={statusTabs} value={statusFilter} onChange={setStatusFilter} size="sm" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <Input
              placeholder="Order ID or amount"
              aria-label="Search payments"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort payments"
              className={cn(inputClass(), "h-11 cursor-pointer appearance-none pl-10 pr-8 text-sm sm:w-48")}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount-high">Amount: high to low</option>
              <option value="amount-low">Amount: low to high</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {displayPayments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5" />}
          title={hasFilters ? "No matching payments" : "No payments yet"}
          text={hasFilters ? "Try a different search or filter." : "Your payments will appear here."}
          action={
            billingHistory.length === 0 ? (
              <Button href="/view-courses">
                <BookOpen className="h-4 w-4" aria-hidden />
                Browse courses
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)] md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-left text-xs font-semibold uppercase tracking-wider text-ink-3">
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {displayPayments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-surface/60">
                    <td className="max-w-[260px] px-6 py-4">
                      <p className="truncate font-mono text-sm font-medium text-ink">{payment.razorpay_order_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-2">{payment.date}</td>
                    <td className="px-6 py-4 font-semibold text-ink">{payment.amount}</td>
                    <td className="px-6 py-4">{statusBadge(payment.status)}</td>
                    <td className="px-6 py-4 text-right">{invoiceButton(payment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <Stagger className="space-y-3 md:hidden">
            {displayPayments.map((payment) => (
              <StaggerItem key={payment.id}>
                <div className="rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xl font-semibold tracking-tight text-ink">{payment.amount}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-3">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        {payment.date}
                      </p>
                    </div>
                    {statusBadge(payment.status)}
                  </div>
                  <p className="mt-3 truncate rounded-lg bg-surface px-3 py-2 font-mono text-xs text-ink-2">{payment.razorpay_order_id}</p>
                  {payment.invoiceUrl && <div className="mt-3">{invoiceButton(payment, true)}</div>}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}

      {/* Invoice modal */}
      {selectedInvoice && (
        <InvoiceBreakdown
          isOpen={invoiceOpen}
          onClose={closeInvoice}
          totalAmount={selectedInvoice.numericAmount}
          date={selectedInvoice.date}
          invoiceNumber={selectedInvoice.razorpay_order_id}
        />
      )}
    </div>
  );
}
