import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderConfirmationRequest {
  orderId: string;
  email: string;
}

interface OrderData {
  id: string;
  customer_info: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    variant: {
      price: number;
      length: string;
    };
    warranty?: {
      months: number;
      additionalCost: number;
    };
    adapter?: boolean;
  }>;
  total: number;
  delivery_method: {
    name: string;
    price: number;
  };
  payment_method: {
    name: string;
    type: string;
  };
  status: string;
  created_at: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function generateCustomerEmailHTML(order: OrderData): string {
  const itemsHTML = order.items.map(item => {
    const itemPrice = item.variant.price;
    const warrantyPrice = item.warranty?.additionalCost || 0;
    const adapterPrice = item.adapter ? 200 : 0;
    const totalItemPrice = (itemPrice + warrantyPrice + adapterPrice) * item.quantity;

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.name}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">
            Длина: ${item.variant.length}
            ${item.warranty ? `<br>Гарантия: ${item.warranty.months} мес.` : ''}
            ${item.adapter ? '<br>С адаптером' : ''}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${formatCurrency(totalItemPrice)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: white; font-size: 28px;">Заказ подтвержден!</h1>
                  </td>
                </tr>

                <!-- Order Info -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                      Здравствуйте, ${order.customer_info.firstName}!
                    </p>
                    <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                      Спасибо за ваш заказ. Мы получили его и начали обработку.
                    </p>

                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Номер заказа:</p>
                      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${order.id}</p>
                    </div>

                    <!-- Order Items -->
                    <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">Детали заказа</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #f9fafb;">
                          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Товар</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Кол-во</th>
                          <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Цена</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHTML}
                        <tr>
                          <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Итого:</td>
                          <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 18px; color: #667eea;">
                            ${formatCurrency(order.total)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Delivery Info -->
                    <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 6px;">
                      <h3 style="margin: 0 0 15px; font-size: 16px; color: #111827;">Информация о доставке</h3>
                      <p style="margin: 0 0 8px; color: #374151;">
                        <strong>Адрес:</strong><br>
                        ${order.customer_info.address.street}<br>
                        ${order.customer_info.address.city}, ${order.customer_info.address.postalCode}<br>
                        ${order.customer_info.address.country}
                      </p>
                      <p style="margin: 15px 0 0; color: #374151;">
                        <strong>Телефон:</strong> ${order.customer_info.phone}
                      </p>
                      <p style="margin: 8px 0 0; color: #374151;">
                        <strong>Способ оплаты:</strong> ${order.payment_method.name}
                      </p>
                    </div>

                    <p style="margin: 30px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Если у вас есть вопросы, свяжитесь с нами по email или телефону.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} LED-Nabor. Все права защищены.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function generateAdminEmailHTML(order: OrderData): string {
  const itemsHTML = order.items.map(item => {
    const itemPrice = item.variant.price;
    const warrantyPrice = item.warranty?.additionalCost || 0;
    const adapterPrice = item.adapter ? 200 : 0;
    const totalItemPrice = (itemPrice + warrantyPrice + adapterPrice) * item.quantity;

    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.variant.length}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(totalItemPrice)}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #667eea;">Новый заказ: ${order.id}</h2>

        <h3>Информация о клиенте</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px;"><strong>Имя:</strong></td>
            <td style="padding: 5px;">${order.customer_info.firstName} ${order.customer_info.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Email:</strong></td>
            <td style="padding: 5px;">${order.customer_info.email}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Телефон:</strong></td>
            <td style="padding: 5px;">${order.customer_info.phone}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>Адрес:</strong></td>
            <td style="padding: 5px;">
              ${order.customer_info.address.street},
              ${order.customer_info.address.city},
              ${order.customer_info.address.postalCode},
              ${order.customer_info.address.country}
            </td>
          </tr>
        </table>

        <h3>Детали заказа</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Товар</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Длина</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Кол-во</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Цена</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Итого:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">
                ${formatCurrency(order.total)}
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Дополнительная информация</h3>
        <p><strong>Способ оплаты:</strong> ${order.payment_method.name}</p>
        <p><strong>Статус:</strong> ${order.status}</p>
        <p><strong>Дата создания:</strong> ${new Date(order.created_at).toLocaleString('ru-RU')}</p>
      </body>
    </html>
  `;
}

async function sendEmail(
  resendApiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[RESEND ERROR]", response.status, errorData);
      return { success: false, error: `Resend API error: ${response.status}` };
    }

    const data = await response.json();
    console.log("[RESEND SUCCESS]", data);
    return { success: true };
  } catch (error) {
    console.error("[RESEND EXCEPTION]", error);
    return { success: false, error: error.message };
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[ORDER CONFIRMATION] Starting email send process");

    // Get environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!resendApiKey) {
      console.error("[ORDER CONFIRMATION] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email service not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: OrderConfirmationRequest = await req.json();
    const { orderId, email } = body;

    console.log("[ORDER CONFIRMATION] Processing order:", orderId, "for email:", email);

    if (!orderId || !email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing orderId or email",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role key to read order
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[ORDER CONFIRMATION] Order not found:", orderError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Order not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[ORDER CONFIRMATION] Order fetched successfully");

    // Generate email HTML
    const customerEmailHTML = generateCustomerEmailHTML(order as OrderData);
    const adminEmailHTML = generateAdminEmailHTML(order as OrderData);

    // Send email to customer
    console.log("[ORDER CONFIRMATION] Sending email to customer:", email);
    const customerEmailResult = await sendEmail(
      resendApiKey,
      fromEmail,
      email,
      `Заказ подтвержден: ${orderId.substring(0, 8)}`,
      customerEmailHTML
    );

    if (!customerEmailResult.success) {
      console.error("[ORDER CONFIRMATION] Failed to send customer email:", customerEmailResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: customerEmailResult.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[ORDER CONFIRMATION] Customer email sent successfully");

    // Send email to admin (if configured)
    if (adminEmail) {
      console.log("[ORDER CONFIRMATION] Sending email to admin:", adminEmail);
      const adminEmailResult = await sendEmail(
        resendApiKey,
        fromEmail,
        adminEmail,
        `Новый заказ: ${orderId.substring(0, 8)}`,
        adminEmailHTML
      );

      if (!adminEmailResult.success) {
        console.warn("[ORDER CONFIRMATION] Failed to send admin email:", adminEmailResult.error);
        // Don't fail the request if admin email fails
      } else {
        console.log("[ORDER CONFIRMATION] Admin email sent successfully");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Order confirmation emails sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[ORDER CONFIRMATION] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
