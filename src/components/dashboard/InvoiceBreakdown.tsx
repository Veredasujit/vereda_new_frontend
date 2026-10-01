"use client";
import React, { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { CheckCircle2, Download, Mail, Globe, Printer, Share2 } from "lucide-react";
import { Badge, Button, Modal } from "@/ui";

interface InvoiceProps {
  totalAmount: number;
  userName?: string;
  userPhone?: string;
  date?: string;
  courseName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  currency?: string;
  gstRate?: number;
  companyEmail?: string;
  companyWebsite?: string;
  invoiceNumber?: string;
}

// Escape values interpolated into the print window HTML
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const InvoiceBreakdown: React.FC<InvoiceProps> = ({
  totalAmount,
  userName: userNameProp,
  userPhone: userPhoneProp,
  date = new Date().toLocaleDateString("en-IN"),
  courseName = "Mastery in Mobile App Development",
  isOpen = true,
  onClose = () => {},
  currency = "₹",
  gstRate = 18,
  companyEmail = "support@vereda.co.in",
  companyWebsite = "www.vereda.co.in",
  invoiceNumber,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const safeTotal = Number.isFinite(totalAmount) && totalAmount > 0 ? totalAmount : 0;

  const invoiceDetails = useMemo(() => {
    if (safeTotal <= 0) {
      return { base: "0.00", gstAmount: "0.00", halfGst: "0.00" };
    }

    const base = (safeTotal / (1 + gstRate / 100)).toFixed(2);
    const gstAmount = (safeTotal - Number(base)).toFixed(2);
    const halfGst = (Number(gstAmount) / 2).toFixed(2);

    return { base, gstAmount, halfGst };
  }, [safeTotal, gstRate]);

  const { base, gstAmount, halfGst } = invoiceDetails;
  const totalFormatted = safeTotal.toFixed(2);

  const userData = useSelector((state: RootState) => state.auth.user);

  const userName = userNameProp || userData?.name || "User";
  const userPhone = userPhoneProp || userData?.phone || "—";

  const handleDownloadPDF = () => {
    handlePrint();
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download or print the invoice.");
      return;
    }

    const companyName = "Vereda Digital Learning";
    const companyAddress =
      "Sinha Library road, Venture park, Patna Lodipur, Patna, Bihar 800001, India";
    const logoUrl = `${window.location.origin}/images/logo.png`;
    const invNo = invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;

    const e = {
      courseName: escapeHtml(courseName),
      userName: escapeHtml(userName),
      userPhone: escapeHtml(userPhone),
      date: escapeHtml(date),
      invNo: escapeHtml(invNo),
      companyEmail: escapeHtml(companyEmail),
      companyWebsite: escapeHtml(companyWebsite),
    };

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${e.courseName}</title>
        <meta charset="UTF-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1f2937;
            line-height: 1.6;
            background: #ffffff;
          }
          .print-container { max-width: 210mm; margin: 0 auto; }
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1055C9;
          }
          .company-logo { height: 48px; margin-bottom: 10px; }
          .invoice-info { text-align: right; flex-shrink: 0; }
          .invoice-title { font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 5px 0; }
          .invoice-meta { font-size: 14px; color: #6b7280; }
          .print-section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-card { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .info-label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
          .info-value { font-size: 14px; font-weight: 600; color: #111827; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .invoice-table th {
            background: #f3f4f6;
            color: #111827;
            padding: 10px 14px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
          }
          .invoice-table td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
          .amount-cell { text-align: right; font-weight: 600; }
          .text-right { text-align: right; }
          .total-section {
            margin-top: 24px;
            border: 1px solid #e5e7eb;
            padding: 16px 20px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-label { font-size: 15px; font-weight: 600; }
          .total-amount { font-size: 22px; font-weight: 700; color: #1055C9; margin: 0; }
          .print-status {
            border: 1px solid #a7f3d0;
            background: #ecfdf5;
            color: #047857;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            margin: 24px 0;
            font-weight: 600;
            font-size: 14px;
          }
          .print-footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .mb-4 { margin-bottom: 16px; }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @media print {
            @page { margin: 15mm; size: A4; }
          }
          @media screen {
            body { background: #f3f4f6; padding: 20px; }
            .print-container { background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <div>
              <img src="${logoUrl}" alt="${companyName}" class="company-logo" onerror="this.style.display='none'">
              <h2 style="margin: 0; color: #111827; font-size: 20px; font-weight: 700;">${companyName}</h2>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${companyAddress}</p>
              <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">GSTIN: 07AABCU9603R1ZM</p>
            </div>
            <div class="invoice-info">
              <h1 class="invoice-title">Invoice</h1>
              <div class="invoice-meta">
                <div><strong>Invoice no:</strong> ${e.invNo}</div>
                <div><strong>Date:</strong> ${e.date}</div>
              </div>
            </div>
          </div>

          <div class="print-section">
            <div class="section-grid">
              <div class="info-card">
                <div class="section-title">Bill to</div>
                <div class="mb-4">
                  <div class="info-label">Student name</div>
                  <div class="info-value">${e.userName}</div>
                </div>
                <div>
                  <div class="info-label">Phone number</div>
                  <div class="info-value">${e.userPhone}</div>
                </div>
              </div>
              <div class="info-card">
                <div class="section-title">Course</div>
                <div class="mb-4">
                  <div class="info-label">Course name</div>
                  <div class="info-value">${e.courseName}</div>
                </div>
                <div>
                  <div class="info-label">Enrollment status</div>
                  <div class="info-value" style="color: #047857;">Completed</div>
                </div>
              </div>
            </div>
          </div>

          <div class="print-section">
            <div class="section-title">Breakdown</div>
            <table class="invoice-table">
              <thead>
                <tr>
                  <th style="width: 50%;">Description</th>
                  <th style="width: 20%;">Rate</th>
                  <th style="width: 15%;">GST</th>
                  <th style="width: 15%;" class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${e.courseName}</strong><br>
                    <span style="color: #6b7280; font-size: 12px;">Base course fee</span>
                  </td>
                  <td>${currency}${base}</td>
                  <td>${gstRate}%</td>
                  <td class="amount-cell">${currency}${base}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding-left: 30px;"><strong>GST</strong></td>
                  <td class="amount-cell">${currency}${gstAmount}</td>
                </tr>
                <tr>
                  <td style="padding-left: 45px; font-size: 13px;">CGST (${gstRate / 2}%)</td>
                  <td></td>
                  <td></td>
                  <td class="amount-cell">${currency}${halfGst}</td>
                </tr>
                <tr>
                  <td style="padding-left: 45px; font-size: 13px;">SGST (${gstRate / 2}%)</td>
                  <td></td>
                  <td></td>
                  <td class="amount-cell">${currency}${halfGst}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <div class="total-label">Total paid</div>
            <div class="total-amount">${currency}${totalFormatted}</div>
          </div>

          <div class="print-status">Payment successful</div>

          <div class="print-section">
            <div class="info-card">
              <div class="section-title">Notes</div>
              <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #6b7280;">
                <li>This is a computer-generated invoice and does not require a signature.</li>
              </ul>
            </div>
          </div>

          <div class="print-footer">
            <div>${e.companyEmail} &middot; ${e.companyWebsite}</div>
            <p style="margin: 12px 0 0 0;">Thank you for choosing ${companyName}.</p>
          </div>
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        setTimeout(() => {
          printWindow.close();
        }, 500);
      };
    }, 1000);
  };

  const handleShare = async () => {
    const invoiceText = `Course: ${courseName}\nAmount: ${currency}${totalFormatted}\nDate: ${date}\nStudent: ${userName}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Course invoice",
          text: invoiceText,
        });
      } catch {
        // Share cancelled by user
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(invoiceText);
      setShareMessage("Invoice details copied to clipboard.");
    } catch {
      setShareMessage("Couldn't copy invoice details.");
    }
  };

  const rows = [
    { label: "Student", value: userName },
    { label: "Phone", value: userPhone },
    { label: "Date", value: date },
    { label: "Invoice no.", value: invoiceNumber || "—" },
  ];

  return (
    <Modal open={isOpen} onClose={onClose} title="Payment summary" size="lg">
      <div ref={invoiceRef} className="space-y-5">
        {/* Amount hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-white p-5 ring-1 ring-inset ring-brand-100 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-brand-200/50 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-ink-3">Total paid</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">
                {currency}
                {totalFormatted}
              </p>
              <p className="mt-1.5 line-clamp-2 text-sm font-medium text-ink-2">{courseName}</p>
            </div>
            <Badge tone="success" className="self-start sm:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Payment successful
            </Badge>
          </div>
        </div>

        {/* Details */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl border border-line p-5">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wider text-ink-3">{row.label}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-ink" title={row.value}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Breakdown */}
        <section className="rounded-2xl border border-line p-5">
          <h3 className="text-sm font-semibold text-ink">Breakdown</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-3">Base course price</span>
              <span className="font-medium text-ink">
                {currency}
                {base}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-3">GST @ {gstRate}%</span>
              <span className="font-medium text-ink">
                {currency}
                {gstAmount}
              </span>
            </div>
            <div className="space-y-1.5 rounded-xl bg-surface px-4 py-3 text-ink-3">
              <div className="flex justify-between">
                <span>CGST @ {gstRate / 2}%</span>
                <span>
                  {currency}
                  {halfGst}
                </span>
              </div>
              <div className="flex justify-between">
                <span>SGST @ {gstRate / 2}%</span>
                <span>
                  {currency}
                  {halfGst}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4 text-base font-semibold">
              <span className="text-ink">Total paid</span>
              <span className="text-brand-700">
                {currency}
                {totalFormatted}
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col items-center justify-center gap-2 text-xs text-ink-3 sm:flex-row sm:gap-6">
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            {companyEmail}
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" aria-hidden />
            {companyWebsite}
          </span>
        </div>

        {shareMessage && (
          <p className="text-center text-sm text-ink-2" role="status">
            {shareMessage}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
          <Button onClick={handleDownloadPDF} className="sm:flex-1">
            <Download className="h-4 w-4" aria-hidden />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4" aria-hidden />
            Print
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden />
            Share
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceBreakdown;
