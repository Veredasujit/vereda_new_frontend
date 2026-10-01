// Builds the webinar participation certificate as a PDF in the browser.
// Later the backend can generate and store this; the layout can stay the same.

import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { Webinar } from "./types";
import { fmtDateLong, fmtDuration, pdfSafe, totalMinutes } from "./utils";

const BLUE = rgb(16 / 255, 85 / 255, 201 / 255); // #1055C9 (site secondary)
const INK = rgb(17 / 255, 24 / 255, 39 / 255); // gray-900
const MUTED = rgb(107 / 255, 114 / 255, 128 / 255); // gray-500
const LINE = rgb(229 / 255, 231 / 255, 235 / 255);

export class CertificateNameError extends Error {
  name = "CertificateNameError";
}

function centered(page: PDFPage, text: string, y: number, font: PDFFont, size: number, color = INK) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - w) / 2, y, size, font, color });
}

/** Shrink text until it fits `max` width. */
function fit(font: PDFFont, text: string, size: number, max: number) {
  let s = size;
  while (s > 10 && font.widthOfTextAtSize(text, s) > max) s -= 1;
  return s;
}

export async function buildCertificatePdf(opts: {
  name: string;
  webinar: Webinar;
  certId: string;
  speakers: string[];
  verifyUrl: string;
}) {
  const name = pdfSafe(opts.name);
  if (name.length < 2) {
    throw new CertificateNameError(
      "Your name has characters the certificate can't print yet. Update your name in English in Settings, then try again.",
    );
  }

  const doc = await PDFDocument.create();
  doc.setTitle(`Certificate — ${pdfSafe(opts.webinar.title)}`);
  doc.setAuthor("Vereda Digital Learning");
  const page = doc.addPage([842, 595]); // A4 landscape
  const W = page.getWidth();
  const H = page.getHeight();

  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // frame
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, borderColor: BLUE, borderWidth: 3 });
  page.drawRectangle({ x: 30, y: 30, width: W - 60, height: H - 60, borderColor: LINE, borderWidth: 1 });
  page.drawRectangle({ x: 20, y: H - 64, width: W - 40, height: 44, color: BLUE });

  page.drawText("VEREDA DIGITAL LEARNING", { x: 48, y: H - 48, size: 13, font: sansBold, color: rgb(1, 1, 1) });
  const tag = "WEBINAR";
  page.drawText(tag, { x: W - 48 - sansBold.widthOfTextAtSize(tag, 11), y: H - 47, size: 11, font: sansBold, color: rgb(1, 1, 1) });

  centered(page, "Certificate of Participation", H - 140, serif, 38);
  centered(page, "This is to certify that", H - 185, sans, 13, MUTED);

  const nameSize = fit(serifItalic, name, 40, W - 200);
  centered(page, name, H - 245, serifItalic, nameSize, BLUE);
  page.drawLine({ start: { x: 220, y: H - 258 }, end: { x: W - 220, y: H - 258 }, thickness: 1, color: LINE });

  centered(page, "attended the live webinar", H - 290, sans, 13, MUTED);
  const title = pdfSafe(opts.webinar.title);
  centered(page, title, H - 325, sansBold, fit(sansBold, title, 20, W - 160));

  const last = opts.webinar.sessions[opts.webinar.sessions.length - 1];
  const line = `${fmtDateLong(last.startsAt)}   |   ${fmtDuration(totalMinutes(opts.webinar))}   |   Online, live`;
  centered(page, pdfSafe(line), H - 352, sans, 12, MUTED);

  // footer: speakers + id
  const speakers = pdfSafe(opts.speakers.join(", "));
  page.drawLine({ start: { x: 70, y: 120 }, end: { x: 300, y: 120 }, thickness: 1, color: INK });
  page.drawText(speakers, { x: 70, y: 102, size: fit(sans, speakers, 12, 240), font: sans, color: INK });
  page.drawText("Speaker", { x: 70, y: 86, size: 10, font: sans, color: MUTED });

  const idLabel = `Certificate ID: ${opts.certId}`;
  const verify = `Verify at ${opts.verifyUrl}`;
  page.drawText(idLabel, { x: W - 70 - sansBold.widthOfTextAtSize(idLabel, 11), y: 102, size: 11, font: sansBold, color: INK });
  page.drawText(verify, { x: W - 70 - sans.widthOfTextAtSize(verify, 9), y: 86, size: 9, font: sans, color: MUTED });

  return doc.save();
}

export async function downloadCertificatePdf(opts: Parameters<typeof buildCertificatePdf>[0]) {
  const bytes = await buildCertificatePdf(opts);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Vereda-Webinar-Certificate-${opts.certId}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
