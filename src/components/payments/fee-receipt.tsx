"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SCHOOL_LOGO, SCHOOL_NAME } from "@/lib/constants";
import type { FeePayment, Student } from "@/lib/types";
import { Download, Eye, Printer, Share2 } from "lucide-react";

type FeeReceiptProps = {
  payment: FeePayment | null;
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function receiptNumber(payment: FeePayment | null) {
  if (!payment) return "JES-000000";
  return payment.receiptNumber || `JES-${payment.id.toUpperCase().slice(0, 6)}`;
}

function qrPattern(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const cells = Array.from({ length: 49 }, (_, i) => ((hash >> (i % 24)) + i * 7) % 3 === 0);
  return cells;
}

function receiptHtml(payment: FeePayment, student: Student | null) {
  const receiptId = receiptNumber(payment);
  const balance = student ? Math.max((student.totalFees || 0) - (student.feesPaid || 0), 0) : 0;
  const qrCells = qrPattern(receiptId);

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${receiptId}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; color: #172033; background: #f6f3ee; }
    .receipt { position: relative; max-width: 760px; margin: 0 auto; background: white; border: 1px solid #ead8c8; padding: 28px; overflow: hidden; }
    .watermark { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(245, 124, 35, 0.07); font-size: 58px; font-weight: 900; transform: rotate(-24deg); pointer-events: none; text-align: center; }
    .content { position: relative; z-index: 1; }
    .top { display: flex; justify-content: space-between; gap: 20px; border-bottom: 3px solid #f57c23; padding-bottom: 18px; }
    .school { display: flex; gap: 14px; align-items: center; }
    .logo { width: 74px; height: 74px; border-radius: 50%; object-fit: cover; border: 3px solid #fff1e6; }
    h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
    .muted { color: #6b7280; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .receipt-no { text-align: right; }
    .receipt-no strong { display: block; font-size: 20px; color: #f57c23; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 22px; }
    .box { border: 1px solid #f0dfd0; padding: 16px; background: #fffaf5; }
    .box h2 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase; color: #9a4d10; letter-spacing: 0.08em; }
    .row { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; border-bottom: 1px dashed #ead8c8; font-size: 14px; }
    .row:last-child { border-bottom: 0; }
    .amount { margin-top: 22px; padding: 18px; background: #f57c23; color: white; display: flex; justify-content: space-between; align-items: center; }
    .amount span { font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; }
    .amount strong { font-size: 30px; }
    .bottom { display: grid; grid-template-columns: 120px 1fr 180px; gap: 18px; align-items: end; margin-top: 28px; }
    .qr { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; width: 110px; padding: 8px; border: 1px solid #ead8c8; }
    .qr i { width: 10px; height: 10px; background: #172033; display: block; }
    .qr i.off { background: #f2e6dc; }
    .note { font-size: 12px; color: #6b7280; line-height: 1.5; }
    .signature { border-top: 1px solid #172033; padding-top: 8px; text-align: center; font-size: 12px; font-weight: 800; text-transform: uppercase; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { border: 0; max-width: none; min-height: 100vh; }
    }
    @media (max-width: 640px) {
      body { padding: 8px; }
      .receipt { padding: 18px; }
      .top, .grid, .bottom { grid-template-columns: 1fr; display: grid; }
      .receipt-no { text-align: left; }
      .amount { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <section class="receipt">
    <div class="watermark">PAID RECEIPT</div>
    <div class="content">
      <div class="top">
        <div class="school">
          <img class="logo" src="${SCHOOL_LOGO}" alt="School Logo" />
          <div>
            <h1>${SCHOOL_NAME}</h1>
            <div class="muted">Official Fee Receipt</div>
          </div>
        </div>
        <div class="receipt-no">
          <div class="muted">Receipt Number</div>
          <strong>${receiptId}</strong>
          <div class="muted">${payment.date}</div>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <h2>Student Details</h2>
          <div class="row"><span>Name</span><strong>${student?.fullName || payment.studentName}</strong></div>
          <div class="row"><span>Class</span><strong>${student?.class || "-"}</strong></div>
          <div class="row"><span>Roll No.</span><strong>${student?.rollNumber || "-"}</strong></div>
          <div class="row"><span>Aadhaar</span><strong>${student?.aadhaarNumber || "-"}</strong></div>
        </div>
        <div class="box">
          <h2>Payment Details</h2>
          <div class="row"><span>Mode</span><strong>${payment.mode}</strong></div>
          <div class="row"><span>Date</span><strong>${payment.date}</strong></div>
          <div class="row"><span>Total Fee</span><strong>Rs. ${(student?.totalFees || 0).toLocaleString()}</strong></div>
          <div class="row"><span>Balance</span><strong>Rs. ${balance.toLocaleString()}</strong></div>
        </div>
      </div>

      <div class="amount">
        <span>Amount Received</span>
        <strong>Rs. ${payment.amount.toLocaleString()}</strong>
      </div>

      <div class="bottom">
        <div class="qr">${qrCells.map((on) => `<i class="${on ? "" : "off"}"></i>`).join("")}</div>
        <p class="note">This computer-generated receipt confirms the fee payment recorded in the school management system. Please keep it for your records.</p>
        <div class="signature">Authorized Signature</div>
      </div>
    </div>
  </section>
</body>
</html>`;
}

function openReceiptWindow(payment: FeePayment, student: Student | null, shouldPrint = false) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
  if (!popup) return false;

  popup.document.open();
  popup.document.write(receiptHtml(payment, student));
  popup.document.close();

  if (shouldPrint) {
    window.setTimeout(() => {
      popup.focus();
      popup.print();
    }, 250);
  }
  return true;
}

export function FeeReceiptDialog({ payment, student, open, onOpenChange }: FeeReceiptProps) {
  if (!payment) return null;

  const receiptId = receiptNumber(payment);
  const balance = student ? Math.max((student.totalFees || 0) - (student.feesPaid || 0), 0) : 0;
  const qrCells = qrPattern(receiptId);

  const handlePreview = () => openReceiptWindow(payment, student, false);
  const handlePdf = () => openReceiptWindow(payment, student, true);
  const handlePrint = () => openReceiptWindow(payment, student, true);
  const handleShare = async () => {
    const text = `${SCHOOL_NAME} fee receipt ${receiptId} for ${payment.studentName}: Rs. ${payment.amount.toLocaleString()} on ${payment.date}.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: receiptId, text });
        return;
      }
      await navigator.clipboard?.writeText(text);
    } catch (error) {
      console.error("Unable to share receipt", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[96svh] w-[96vw] max-w-4xl overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Fee Receipt {receiptId}</DialogTitle>
        </DialogHeader>
        <div className="receipt-print bg-[#f7f2ec] p-3 sm:p-6">
          <div className="relative mx-auto max-w-3xl overflow-hidden bg-white p-5 shadow-xl ring-1 ring-orange-100 sm:p-8">
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center text-5xl font-black uppercase text-orange-500/10 -rotate-12">
              Paid Receipt
            </div>
            <div className="relative z-10">
              <div className="flex flex-col gap-4 border-b-4 border-primary pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={SCHOOL_LOGO} alt="School Logo" className="h-16 w-16 rounded-full border-4 border-orange-100 object-cover" />
                  <div>
                    <h2 className="text-xl font-black uppercase text-[#172033]">{SCHOOL_NAME}</h2>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Official Fee Receipt</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Receipt Number</p>
                  <p className="text-lg font-black text-primary">{receiptId}</p>
                  <p className="text-xs font-bold text-muted-foreground">{payment.date}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <section className="border border-orange-100 bg-orange-50/50 p-4">
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-orange-800">Student Details</h3>
                  <InfoRow label="Name" value={student?.fullName || payment.studentName} />
                  <InfoRow label="Class" value={student?.class || "-"} />
                  <InfoRow label="Roll No." value={student?.rollNumber || "-"} />
                  <InfoRow label="Aadhaar" value={student?.aadhaarNumber || "-"} />
                </section>
                <section className="border border-orange-100 bg-orange-50/50 p-4">
                  <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-orange-800">Payment Details</h3>
                  <InfoRow label="Mode" value={payment.mode} />
                  <InfoRow label="Date" value={payment.date} />
                  <InfoRow label="Total Fee" value={`Rs. ${(student?.totalFees || 0).toLocaleString()}`} />
                  <InfoRow label="Balance" value={`Rs. ${balance.toLocaleString()}`} />
                </section>
              </div>

              <div className="mt-5 flex flex-col gap-1 bg-primary p-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-black uppercase tracking-widest">Amount Received</span>
                <strong className="text-3xl">Rs. {payment.amount.toLocaleString()}</strong>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-[120px_1fr_180px] sm:items-end">
                <div className="grid w-[112px] grid-cols-7 gap-1 border border-orange-100 p-2">
                  {qrCells.map((on, index) => (
                    <span key={index} className={`h-2.5 w-2.5 ${on ? "bg-[#172033]" : "bg-orange-100"}`} />
                  ))}
                </div>
                <p className="text-xs font-medium leading-5 text-muted-foreground">
                  This receipt confirms the payment recorded in the school management system. Please keep it for school and parent records.
                </p>
                <div className="border-t border-[#172033] pt-2 text-center text-xs font-black uppercase text-[#172033]">
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>

          <div className="no-print mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
            <Button type="button" variant="outline" onClick={handlePreview} className="gap-2">
              <Eye className="h-4 w-4" /> Preview
            </Button>
            <Button type="button" onClick={handlePdf} className="gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button type="button" variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button type="button" variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-orange-200 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <strong className="text-right text-[#172033]">{value}</strong>
    </div>
  );
}
