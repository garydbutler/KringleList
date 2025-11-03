// src/lib/jobs/alert-dispatcher.ts
import { PriceAlert } from "./price-monitor";
import { db } from "../db/client";

export interface BundledAlert {
  userEmail: string;
  priceDrops: PriceAlert[];
  restocks: PriceAlert[];
}

/**
 * Bundle alerts by user to send consolidated emails
 * Enforces rate limits (max 5 per day per user)
 */
export async function bundleAndDispatchAlerts(
  alerts: PriceAlert[]
): Promise<void> {
  if (alerts.length === 0) {
    console.log("No alerts to dispatch");
    return;
  }

  // Group alerts by user email
  const alertsByUser = new Map<string, PriceAlert[]>();

  for (const alert of alerts) {
    const existing = alertsByUser.get(alert.userEmail) || [];
    existing.push(alert);
    alertsByUser.set(alert.userEmail, existing);
  }

  console.log(`Dispatching alerts for ${alertsByUser.size} users`);

  // Process each user's alerts
  for (const [userEmail, userAlerts] of alertsByUser) {
    try {
      // Check rate limit (max 5 alerts per day per FR-047)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const alertCount = await db.alertHistory.count({
        where: {
          userEmail,
          sentAt: {
            gte: today,
          },
        },
      });

      if (alertCount >= 5) {
        console.log(`Rate limit reached for ${userEmail}, skipping`);
        continue;
      }

      // Bundle alerts by type
      const bundled: BundledAlert = {
        userEmail,
        priceDrops: userAlerts.filter((a) => a.alertType === "PRICE_DROP"),
        restocks: userAlerts.filter((a) => a.alertType === "RESTOCK"),
      };

      // Check quiet hours (assuming 10 PM - 8 AM local time, simplified)
      // In a real implementation, this would check user preferences
      const hour = new Date().getHours();
      const isQuietHours = hour >= 22 || hour < 8;

      if (isQuietHours) {
        console.log(`Quiet hours for ${userEmail}, deferring alerts`);
        // In a real implementation, queue for later delivery
        continue;
      }

      // Send email (placeholder - would integrate with Resend)
      await sendAlertEmail(bundled);

      // Record in alert history
      for (const alert of userAlerts) {
        await db.alertHistory.create({
          data: {
            userEmail: alert.userEmail,
            bagItemId: alert.bagItemId,
            alertType: alert.alertType,
            sentAt: new Date(),
            priceDropCents: alert.oldPriceCents
              ? alert.oldPriceCents - alert.newPriceCents
              : null,
          },
        });
      }

      console.log(
        `Sent ${userAlerts.length} alerts to ${userEmail}`
      );
    } catch (error) {
      console.error(`Error dispatching alerts for ${userEmail}:`, error);
    }
  }
}

/**
 * Send alert email to user
 * In production, this would use the Resend API with React Email templates
 */
async function sendAlertEmail(bundled: BundledAlert): Promise<void> {
  // Placeholder for email sending
  // In production, this would use Resend with React Email templates
  console.log(`[EMAIL] Sending to ${bundled.userEmail}:`);
  console.log(`  - ${bundled.priceDrops.length} price drops`);
  console.log(`  - ${bundled.restocks.length} restock alerts`);

  // Example integration (not functional without Resend setup):
  /*
  import { resend } from "../email/client";
  import { PriceDropAlert } from "../email/templates/PriceDropAlert";

  await resend.emails.send({
    from: "alerts@kringlelist.com",
    to: bundled.userEmail,
    subject: `${bundled.priceDrops.length + bundled.restocks.length} Gift Alerts`,
    react: PriceDropAlert({ bundled }),
  });
  */
}
