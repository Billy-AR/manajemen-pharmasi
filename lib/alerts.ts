import nodemailer from "nodemailer";
import { adminDb } from "./firebase-admin";

type MedicineDoc = {
  name: string;
  stock?: number;
  minStock?: number;
  expiredAt?: number;
  supplierId?: string;
};

type AlertItem = {
  id: string;
  name: string;
  stock?: number;
  minStock?: number;
  expiredAt?: number;
  reason: "lowStock" | "expiredSoon";
};

function getThresholds() {
  const minStock = Number(process.env.ALERT_MIN_STOCK ?? 5);
  const daysBefore = Number(process.env.ALERT_DAYS_BEFORE_EXPIRE ?? 14);
  const expireBefore = Date.now() + daysBefore * 24 * 60 * 60 * 1000;
  return { minStock, expireBefore };
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP env belum lengkap (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildEmail(items: AlertItem[]) {
  const from = process.env.ALERT_EMAIL_FROM || "notifier@example.com";
  const to = process.env.ALERT_EMAIL_TO || process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
  const subject = "🚨 [Apotek] Alert Stok & Kadaluarsa";

  const lowStockItems = items.filter((i) => i.reason === "lowStock");
  const expiringItems = items.filter((i) => i.reason === "expiredSoon");

  const lowStockRows = lowStockItems
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px; color: #1f2937; font-weight: 500;">${item.name}</td>
      <td style="padding: 12px; text-align: center;">
        <span style="background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600;">
          ${item.stock ?? "-"}
        </span>
      </td>
      <td style="padding: 12px; text-align: center; color: #6b7280;">${item.minStock ?? "-"}</td>
      <td style="padding: 12px;">
        <span style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
          ⚠️ Stok Rendah
        </span>
      </td>
    </tr>
  `
    )
    .join("");

  const expiringRows = expiringItems
    .map((item) => {
      const expDate = item.expiredAt ? new Date(item.expiredAt).toLocaleDateString("id-ID") : "-";
      return `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px; color: #1f2937; font-weight: 500;">${item.name}</td>
      <td style="padding: 12px; text-align: center; color: #6b7280;">${item.stock ?? "-"}</td>
      <td style="padding: 12px; text-align: center;">
        <span style="background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;">
          ${expDate}
        </span>
      </td>
      <td style="padding: 12px;">
        <span style="background: #fecaca; color: #b91c1c; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
          🔴 Kadaluarsa
        </span>
      </td>
    </tr>
  `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 100%); padding: 40px 20px;">
  
  <table style="max-width: 650px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px -20px rgba(16, 185, 129, 0.4);">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">💊</div>
        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">Peringatan Apotek</h1>
        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Notifikasi Stok & Kadaluarsa</p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding: 30px;">
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
          Halo Admin 👋
        </p>
        <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
          Berikut adalah <strong>${items.length} item obat</strong> yang memerlukan perhatian segera:
        </p>

        ${
          lowStockItems.length > 0
            ? `
        <!-- Low Stock Section -->
        <div style="margin-bottom: 32px;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: #fef3c7; padding: 8px 16px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 14px; font-weight: 700; color: #d97706;">📦 STOK RENDAH (${lowStockItems.length})</span>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; background: #fefce8; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #fef3c7;">
                <th style="padding: 12px; text-align: left; color: #92400e; font-size: 13px; font-weight: 600;">Nama Obat</th>
                <th style="padding: 12px; text-align: center; color: #92400e; font-size: 13px; font-weight: 600;">Stok</th>
                <th style="padding: 12px; text-align: center; color: #92400e; font-size: 13px; font-weight: 600;">Min</th>
                <th style="padding: 12px; text-align: left; color: #92400e; font-size: 13px; font-weight: 600;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockRows}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          expiringItems.length > 0
            ? `
        <!-- Expiring Soon Section -->
        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: #fee2e2; padding: 8px 16px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 14px; font-weight: 700; color: #dc2626;">⚠️ AKAN KADALUARSA (${expiringItems.length})</span>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; background: #fef2f2; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #fee2e2;">
                <th style="padding: 12px; text-align: left; color: #7f1d1d; font-size: 13px; font-weight: 600;">Nama Obat</th>
                <th style="padding: 12px; text-align: center; color: #7f1d1d; font-size: 13px; font-weight: 600;">Stok</th>
                <th style="padding: 12px; text-align: center; color: #7f1d1d; font-size: 13px; font-weight: 600;">Exp Date</th>
                <th style="padding: 12px; text-align: left; color: #7f1d1d; font-size: 13px; font-weight: 600;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${expiringRows}
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 32px;">
          <a href=${
            process.env.URL_WEBSITE
          } style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
            🔍 Buka Dashboard
          </a>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: #f0fdfa; border-left: 4px solid #14b8a6; border-radius: 6px;">
          <p style="margin: 0; color: #0f766e; font-size: 13px; line-height: 1.5;">
            💡 <strong>Tips:</strong> Segera lakukan restock untuk obat dengan stok rendah dan prioritaskan penjualan obat yang akan kadaluarsa.
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
          Email otomatis dari <strong style="color: #10b981;">Apotek Cloud System</strong>
        </p>
        <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 11px;">
          ${new Date().toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" })}
        </p>
      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const text = `Apotek Alert - ${items.length} item perlu perhatian\n\nStok Rendah: ${lowStockItems.length}\nKadaluarsa: ${expiringItems.length}\n\nBuka dashboard untuk detail.`;

  return { from, to, subject, html, text };
}

export async function runAlertCheck() {
  const { minStock, expireBefore } = getThresholds();

  const lowStock = await adminDb.collection("medicines").where("stock", "<=", minStock).get();

  const expiredSoon = await adminDb.collection("medicines").where("expiredAt", "<=", expireBefore).get();

  const items: AlertItem[] = [];

  lowStock.forEach((doc) => {
    const data = doc.data() as MedicineDoc;
    items.push({
      id: doc.id,
      name: data.name,
      stock: data.stock,
      minStock: data.minStock,
      expiredAt: data.expiredAt,
      reason: "lowStock",
    });
  });

  expiredSoon.forEach((doc) => {
    const data = doc.data() as MedicineDoc;
    items.push({
      id: doc.id,
      name: data.name,
      stock: data.stock,
      minStock: data.minStock,
      expiredAt: data.expiredAt,
      reason: "expiredSoon",
    });
  });

  if (items.length === 0) {
    return { sent: false, items: [] };
  }

  const transporter = getTransporter();
  const email = buildEmail(items);
  await transporter.sendMail(email);

  await adminDb.collection("alerts").add({
    items,
    status: "sent",
    createdAt: Date.now(),
    type: "email",
  });

  return { sent: true, items };
}
