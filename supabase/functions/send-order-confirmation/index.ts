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
  currency: string;
  locale: string;
}

interface Translations {
  orderConfirmed: string;
  hello: string;
  thankYou: string;
  orderNumber: string;
  orderDetails: string;
  item: string;
  quantity: string;
  price: string;
  total: string;
  deliveryInfo: string;
  address: string;
  phone: string;
  paymentMethod: string;
  questionsContact: string;
  allRightsReserved: string;
  newOrder: string;
  customerInfo: string;
  name: string;
  email: string;
  additionalInfo: string;
  status: string;
  dateCreated: string;
  length: string;
  warranty: string;
  withAdapter: string;
  months: string;
  paymentCOD: string;
  paymentStripe: string;
}

const translations: Record<string, Translations> = {
  en: {
    orderConfirmed: "Order Confirmed!",
    hello: "Hello",
    thankYou: "Thank you for your order. We have received it and started processing.",
    orderNumber: "Order number:",
    orderDetails: "Order details",
    item: "Item",
    quantity: "Qty",
    price: "Price",
    total: "Total:",
    deliveryInfo: "Delivery information",
    address: "Address:",
    phone: "Phone:",
    paymentMethod: "Payment method:",
    questionsContact: "If you have any questions, please contact us by email or phone.",
    allRightsReserved: "All rights reserved.",
    newOrder: "New Order",
    customerInfo: "Customer information",
    name: "Name:",
    email: "Email:",
    additionalInfo: "Additional information",
    status: "Status:",
    dateCreated: "Date created:",
    length: "Length",
    warranty: "Warranty:",
    withAdapter: "With adapter",
    months: "mo.",
    paymentCOD: "Cash on Delivery",
    paymentStripe: "Card Payment (Stripe)",
  },
  ru: {
    orderConfirmed: "Заказ подтвержден!",
    hello: "Здравствуйте",
    thankYou: "Спасибо за ваш заказ. Мы получили его и начали обработку.",
    orderNumber: "Номер заказа:",
    orderDetails: "Детали заказа",
    item: "Товар",
    quantity: "Кол-во",
    price: "Цена",
    total: "Итого:",
    deliveryInfo: "Информация о доставке",
    address: "Адрес:",
    phone: "Телефон:",
    paymentMethod: "Способ оплаты:",
    questionsContact: "Если у вас есть вопросы, свяжитесь с нами по email или телефону.",
    allRightsReserved: "Все права защищены.",
    newOrder: "Новый заказ",
    customerInfo: "Информация о клиенте",
    name: "Имя:",
    email: "Email:",
    additionalInfo: "Дополнительная информация",
    status: "Статус:",
    dateCreated: "Дата создания:",
    length: "Длина",
    warranty: "Гарантия:",
    withAdapter: "С адаптером",
    months: "мес.",
    paymentCOD: "Наложенный платеж",
    paymentStripe: "Оплата картой (Stripe)",
  },
  cs: {
    orderConfirmed: "Objednávka potvrzena!",
    hello: "Dobrý den",
    thankYou: "Děkujeme za vaši objednávku. Obdrželi jsme ji a začali zpracovávat.",
    orderNumber: "Číslo objednávky:",
    orderDetails: "Detaily objednávky",
    item: "Položka",
    quantity: "Množ.",
    price: "Cena",
    total: "Celkem:",
    deliveryInfo: "Informace o dodání",
    address: "Adresa:",
    phone: "Telefon:",
    paymentMethod: "Způsob platby:",
    questionsContact: "Máte-li jakékoli dotazy, kontaktujte nás e-mailem nebo telefonem.",
    allRightsReserved: "Všechna práva vyhrazena.",
    newOrder: "Nová objednávka",
    customerInfo: "Informace o zákazníkovi",
    name: "Jméno:",
    email: "Email:",
    additionalInfo: "Další informace",
    status: "Stav:",
    dateCreated: "Datum vytvoření:",
    length: "Délka",
    warranty: "Záruka:",
    withAdapter: "S adaptérem",
    months: "měs.",
    paymentCOD: "Dobírka",
    paymentStripe: "Platba kartou (Stripe)",
  },
};

function getTranslations(locale: string): Translations {
  return translations[locale] || translations.en;
}

function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('[FORMAT CURRENCY ERROR]', error);
    return `${amount} ${currency}`;
  }
}

function getPaymentMethodName(paymentType: string, t: Translations): string {
  if (paymentType === 'cod' || paymentType === 'cash') {
    return t.paymentCOD;
  } else if (paymentType === 'card' || paymentType === 'stripe') {
    return t.paymentStripe;
  }
  return paymentType;
}

function generateCustomerEmailText(order: OrderData, t: Translations): string {
  const itemsText = order.items.map(item => {
    const itemPrice = item.variant.price;
    const warrantyPrice = item.warranty?.additionalCost || 0;
    const adapterPrice = item.adapter ? 200 : 0;
    const totalItemPrice = (itemPrice + warrantyPrice + adapterPrice) * item.quantity;

    let itemDetails = `${item.name}\n${t.length}: ${item.variant.length}`;
    if (item.warranty) {
      itemDetails += `\n${t.warranty} ${item.warranty.months} ${t.months}`;
    }
    if (item.adapter) {
      itemDetails += `\n${t.withAdapter}`;
    }
    itemDetails += `\n${t.quantity}: ${item.quantity} | ${formatCurrency(totalItemPrice, order.currency, order.locale)}`;

    return itemDetails;
  }).join('\n\n');

  const paymentMethodName = getPaymentMethodName(order.payment_method.type, t);

  return `
${t.orderConfirmed}

${t.hello}, ${order.customer_info.firstName}!

${t.thankYou}

${t.orderNumber}
${order.id}

${t.orderDetails}
---
${itemsText}
---
${t.total} ${formatCurrency(order.total, order.currency, order.locale)}

${t.deliveryInfo}
---
${t.address}
${order.customer_info.address.street}
${order.customer_info.address.city}, ${order.customer_info.address.postalCode}
${order.customer_info.address.country}

${t.phone} ${order.customer_info.phone}
${t.paymentMethod} ${paymentMethodName}

${t.questionsContact}

© ${new Date().getFullYear()} LED-Nabor. ${t.allRightsReserved}
  `.trim();
}

function generateCustomerEmailHTML(order: OrderData, t: Translations): string {
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
            ${t.length}: ${item.variant.length}
            ${item.warranty ? `<br>${t.warranty} ${item.warranty.months} ${t.months}` : ''}
            ${item.adapter ? `<br>${t.withAdapter}` : ''}
          </span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${formatCurrency(totalItemPrice, order.currency, order.locale)}
        </td>
      </tr>
    `;
  }).join('');

  const paymentMethodName = getPaymentMethodName(order.payment_method.type, t);

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
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: white; font-size: 28px;">${t.orderConfirmed}</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; font-size: 16px; color: #374151;">
                      ${t.hello}, ${order.customer_info.firstName}!
                    </p>
                    <p style="margin: 0 0 30px; font-size: 16px; color: #374151;">
                      ${t.thankYou}
                    </p>

                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                      <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">${t.orderNumber}</p>
                      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">${order.id}</p>
                    </div>

                    <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">${t.orderDetails}</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #f9fafb;">
                          <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">${t.item}</th>
                          <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">${t.quantity}</th>
                          <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">${t.price}</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHTML}
                        <tr>
                          <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">${t.total}</td>
                          <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 18px; color: #667eea;">
                            ${formatCurrency(order.total, order.currency, order.locale)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 6px;">
                      <h3 style="margin: 0 0 15px; font-size: 16px; color: #111827;">${t.deliveryInfo}</h3>
                      <p style="margin: 0 0 8px; color: #374151;">
                        <strong>${t.address}</strong><br>
                        ${order.customer_info.address.street}<br>
                        ${order.customer_info.address.city}, ${order.customer_info.address.postalCode}<br>
                        ${order.customer_info.address.country}
                      </p>
                      <p style="margin: 15px 0 0; color: #374151;">
                        <strong>${t.phone}</strong> ${order.customer_info.phone}
                      </p>
                      <p style="margin: 8px 0 0; color: #374151;">
                        <strong>${t.paymentMethod}</strong> ${paymentMethodName}
                      </p>
                    </div>

                    <p style="margin: 30px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                      ${t.questionsContact}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      © ${new Date().getFullYear()} LED-Nabor. ${t.allRightsReserved}
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

function generateAdminEmailText(order: OrderData, t: Translations): string {
  const itemsText = order.items.map(item => {
    const itemPrice = item.variant.price;
    const warrantyPrice = item.warranty?.additionalCost || 0;
    const adapterPrice = item.adapter ? 200 : 0;
    const totalItemPrice = (itemPrice + warrantyPrice + adapterPrice) * item.quantity;

    return `${item.name} (${item.variant.length}) x${item.quantity} - ${formatCurrency(totalItemPrice, order.currency, order.locale)}`;
  }).join('\n');

  const paymentMethodName = getPaymentMethodName(order.payment_method.type, t);

  return `
${t.newOrder}: ${order.id.substring(0, 8)}

${t.customerInfo}
---
${t.name} ${order.customer_info.firstName} ${order.customer_info.lastName}
${t.email} ${order.customer_info.email}
${t.phone} ${order.customer_info.phone}
${t.address}
${order.customer_info.address.street}
${order.customer_info.address.city}, ${order.customer_info.address.postalCode}
${order.customer_info.address.country}

${t.orderDetails}
---
${itemsText}
---
${t.total} ${formatCurrency(order.total, order.currency, order.locale)}

${t.additionalInfo}
---
${t.paymentMethod} ${paymentMethodName}
${t.status} ${order.status}
${t.dateCreated} ${new Date(order.created_at).toLocaleString(order.locale)}
  `.trim();
}

function generateAdminEmailHTML(order: OrderData, t: Translations): string {
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
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(totalItemPrice, order.currency, order.locale)}</td>
      </tr>
    `;
  }).join('');

  const paymentMethodName = getPaymentMethodName(order.payment_method.type, t);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #667eea;">${t.newOrder}: ${order.id}</h2>

        <h3>${t.customerInfo}</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 5px;"><strong>${t.name}</strong></td>
            <td style="padding: 5px;">${order.customer_info.firstName} ${order.customer_info.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>${t.email}</strong></td>
            <td style="padding: 5px;">${order.customer_info.email}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>${t.phone}</strong></td>
            <td style="padding: 5px;">${order.customer_info.phone}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>${t.address}</strong></td>
            <td style="padding: 5px;">
              ${order.customer_info.address.street},
              ${order.customer_info.address.city},
              ${order.customer_info.address.postalCode},
              ${order.customer_info.address.country}
            </td>
          </tr>
        </table>

        <h3>${t.orderDetails}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">${t.item}</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">${t.length}</th>
              <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">${t.quantity}</th>
              <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">${t.price}</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">${t.total}</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">
                ${formatCurrency(order.total, order.currency, order.locale)}
              </td>
            </tr>
          </tbody>
        </table>

        <h3>${t.additionalInfo}</h3>
        <p><strong>${t.paymentMethod}</strong> ${paymentMethodName}</p>
        <p><strong>${t.status}</strong> ${order.status}</p>
        <p><strong>${t.dateCreated}</strong> ${new Date(order.created_at).toLocaleString(order.locale)}</p>
      </body>
    </html>
  `;
}

async function sendEmail(
  resendApiKey: string,
  from: string,
  replyTo: string | undefined,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailPayload: any = {
      from,
      to,
      subject,
      html,
      text,
    };

    if (replyTo) {
      emailPayload.reply_to = replyTo;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[ORDER CONFIRMATION] Starting email send process");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";
    const replyToEmail = Deno.env.get("REPLY_TO_EMAIL");
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    console.log("[ORDER CONFIRMATION] Currency:", order.currency, "Locale:", order.locale);

    const locale = order.locale || 'en';
    const currency = order.currency || 'RUB';
    const orderData: OrderData = { ...order, locale, currency };
    const t = getTranslations(locale);

    const customerEmailHTML = generateCustomerEmailHTML(orderData, t);
    const customerEmailText = generateCustomerEmailText(orderData, t);
    const adminEmailHTML = generateAdminEmailHTML(orderData, t);
    const adminEmailText = generateAdminEmailText(orderData, t);

    console.log("[ORDER CONFIRMATION] Sending email to customer:", email);
    const customerEmailResult = await sendEmail(
      resendApiKey,
      fromEmail,
      replyToEmail,
      email,
      `${t.orderConfirmed.replace('!', '')}: ${orderId.substring(0, 8)}`,
      customerEmailHTML,
      customerEmailText
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

    if (adminEmail) {
      console.log("[ORDER CONFIRMATION] Sending email to admin:", adminEmail);
      const adminEmailResult = await sendEmail(
        resendApiKey,
        fromEmail,
        replyToEmail,
        adminEmail,
        `${t.newOrder}: ${orderId.substring(0, 8)}`,
        adminEmailHTML,
        adminEmailText
      );

      if (!adminEmailResult.success) {
        console.warn("[ORDER CONFIRMATION] Failed to send admin email:", adminEmailResult.error);
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
