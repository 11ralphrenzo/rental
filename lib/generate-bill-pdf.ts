import { Bill } from "@/models/bill";
import { formatDate } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Primary color from globals.css: oklch(0.6846 0.2042 24.28) → RGB
const PRIMARY_R = 255;
const PRIMARY_G = 87;
const PRIMARY_B = 87;

// PDF-safe currency formatter (Helvetica cannot render ₱)
function pdfCurrency(amount: number): string {
    const formatted = new Intl.NumberFormat("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount ?? 0);
    return `PHP ${formatted}`;
}

// Load logo as base64 data URL
function loadLogoAsDataUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("No canvas context");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
        img.src = "/logo.png";
    });
}

async function buildBillPdf(bill: Bill): Promise<jsPDF> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ─── Load Logo ─────────────────────────────────────────────────────
    let logoDataUrl: string | null = null;
    try {
        logoDataUrl = await loadLogoAsDataUrl();
    } catch {
        // Logo not found — continue without it
    }

    // ─── Header ────────────────────────────────────────────────────────
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 40, "F");

    // Add logo to header (left side)
    if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", 14, 14, 28, 0);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
    doc.text("RENTAL BILL", pageWidth / 2, 22, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 51, 51);
    doc.text(
        `Billing Period: ${formatDate(bill.month, "MMMM yyyy")}`,
        pageWidth / 2,
        30,
        { align: "center" },
    );

    // ─── Renter Info ───────────────────────────────────────────────────
    const startY = 52;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, startY);
    doc.setFont("helvetica", "normal");
    doc.text(bill.renter?.name ?? "—", 44, startY);

    doc.setFont("helvetica", "bold");
    doc.text("Unit/House:", 14, startY + 8);
    doc.setFont("helvetica", "normal");
    doc.text(bill.renter?.houses?.name ?? bill.renter?.house?.name ?? "—", 44, startY + 8);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", 14, startY + 16);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(bill.month, "MMMM dd, yyyy"), 44, startY + 16);

    // ─── Bill Breakdown Table ──────────────────────────────────────────
    const tableWidth = pageWidth - 28; // 14 margin on each side
    const electricUsage = Number(bill.curr_electricity) - Number(bill.prev_electricity);
    const waterUsage = Number(bill.curr_water) - Number(bill.prev_water);

    autoTable(doc, {
        startY: startY + 26,
        tableWidth: tableWidth,
        head: [["Item Description", "Previous", "Current", "Amount"]],
        body: [
            ["Monthly Rent", "-", "-", pdfCurrency(bill.rent)],
            [
                "Electricity (kW)",
                new Intl.NumberFormat("en-US").format(bill.prev_electricity ?? 0),
                new Intl.NumberFormat("en-US").format(bill.curr_electricity ?? 0),
                pdfCurrency(bill.total_electricity),
            ],
            [
                "Water (m3)",
                new Intl.NumberFormat("en-US").format(bill.prev_water ?? 0),
                new Intl.NumberFormat("en-US").format(bill.curr_water ?? 0),
                pdfCurrency(bill.total_water),
            ],
            ["Other Charges", "-", "-", pdfCurrency(bill.others ?? 0)],
        ],
        foot: [["TOTAL", "", "", pdfCurrency(bill.total)]],
        theme: "striped",
        headStyles: {
            fillColor: [PRIMARY_R, PRIMARY_G, PRIMARY_B],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 11,
        },
        footStyles: {
            fillColor: [255, 235, 235],
            textColor: [51, 51, 51],
            fontStyle: "bold",
            fontSize: 12,
        },
        bodyStyles: {
            fontSize: 10,
            textColor: [51, 65, 85],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            0: { cellWidth: tableWidth * 0.40, fontStyle: "bold", halign: "left" },
            1: { cellWidth: tableWidth * 0.15, halign: "center" },
            2: { cellWidth: tableWidth * 0.15, halign: "center" },
            3: { cellWidth: tableWidth * 0.30, halign: "right" },
        },
        styles: {
            cellPadding: 4,
        },
        margin: { left: 14, right: 14 },
    });

    // ─── Footer ────────────────────────────────────────────────────────
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
        `Generated on ${formatDate(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
    );

    return doc;
}

function getBillFilename(bill: Bill): string {
    const renterName = (bill.renter?.name ?? "bill").replace(/\s+/g, "_");
    const period = formatDate(bill.month, "yyyy-MM");
    return `rental_bill_${renterName}_${period}.pdf`;
}

export async function downloadBillPdf(bill: Bill): Promise<void> {
    const doc = await buildBillPdf(bill);
    doc.save(getBillFilename(bill));
}

export async function viewBillPdf(bill: Bill): Promise<void> {
    const doc = await buildBillPdf(bill);
    const blobUrl = doc.output("bloburl") as unknown as string;
    window.open(blobUrl, "_blank");
}
