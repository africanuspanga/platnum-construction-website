export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev"

  if (!RESEND_API_KEY) {
    console.warn("[v0] RESEND_API_KEY not configured, skipping email")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email")
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error sending email:", error)
    return { success: false, error: error.message }
  }
}

export const emailTemplates = {
  rentalRequest: ({
    clientName,
    clientEmail,
    equipmentName,
    startDate,
    endDate,
    totalCost,
    dashboardLink,
  }: {
    clientName: string
    clientEmail: string
    equipmentName: string
    startDate: string
    endDate: string
    totalCost: number
    dashboardLink: string
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #C5A572; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #C5A572; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Equipment Rental Request</h1>
          </div>
          <div class="content">
            <p>A new equipment rental request has been submitted:</p>
            <div class="details">
              <p><strong>Client:</strong> ${clientName}</p>
              <p><strong>Email:</strong> ${clientEmail}</p>
              <p><strong>Equipment:</strong> ${equipmentName}</p>
              <p><strong>Rental Period:</strong> ${startDate} to ${endDate}</p>
              <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
            </div>
            <p>Please review and approve this request in your admin dashboard.</p>
            <a href="${dashboardLink}" class="button">View in Dashboard</a>
          </div>
        </div>
      </body>
    </html>
  `,

  projectRequest: ({
    clientName,
    clientEmail,
    projectName,
    description,
    budget,
    timeline,
    dashboardLink,
  }: {
    clientName: string
    clientEmail: string
    projectName: string
    description: string
    budget: number
    timeline: string
    dashboardLink: string
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #C5A572; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #C5A572; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Project Request</h1>
          </div>
          <div class="content">
            <p>A new project request has been submitted:</p>
            <div class="details">
              <p><strong>Client:</strong> ${clientName}</p>
              <p><strong>Email:</strong> ${clientEmail}</p>
              <p><strong>Project:</strong> ${projectName}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Budget:</strong> $${budget.toFixed(2)}</p>
              <p><strong>Timeline:</strong> ${timeline}</p>
            </div>
            <p>Please review and assign this project in your admin dashboard.</p>
            <a href="${dashboardLink}" class="button">View in Dashboard</a>
          </div>
        </div>
      </body>
    </html>
  `,

  guestRentalRequest: ({
    guestName,
    guestPhone,
    guestEmail,
    guestCompany,
    items,
    totalCost,
    notes,
  }: {
    guestName: string
    guestPhone: string
    guestEmail?: string | null
    guestCompany?: string | null
    items: Array<{
      equipment_name: string
      start_date: string
      end_date: string
      quantity: number
      daily_rate: string
      total_days: number
    }>
    totalCost: number
    notes?: string
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A5F; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #C5A572; }
          .equipment-item { background: #f5f5f5; padding: 12px; margin: 10px 0; border-radius: 4px; }
          .total { background: #1E3A5F; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚜 New Equipment Rental Request</h1>
          </div>
          <div class="content">
            <h2>Customer Information</h2>
            <div class="details">
              <p><strong>Name:</strong> ${guestName}</p>
              <p><strong>Phone:</strong> ${guestPhone}</p>
              ${guestEmail ? `<p><strong>Email:</strong> ${guestEmail}</p>` : ""}
              ${guestCompany ? `<p><strong>Company:</strong> ${guestCompany}</p>` : ""}
            </div>

            <h2>Equipment Requested</h2>
            ${items
              .map(
                (item) => `
              <div class="equipment-item">
                <p><strong>${item.equipment_name}</strong></p>
                <p>Rental Period: ${new Date(item.start_date).toLocaleDateString()} - ${new Date(item.end_date).toLocaleDateString()} (${item.total_days} days)</p>
                <p>Daily Rate: TSH ${item.daily_rate}</p>
                <p>Quantity: ${item.quantity}</p>
              </div>
            `,
              )
              .join("")}

            ${notes ? `<div class="details"><p><strong>Additional Notes:</strong></p><p>${notes}</p></div>` : ""}

            <div class="total">
              Total Cost: TSH ${totalCost.toLocaleString()}
            </div>

            <p style="margin-top: 20px;">Please contact the customer to confirm availability and finalize the booking.</p>
          </div>
        </div>
      </body>
    </html>
  `,
}
