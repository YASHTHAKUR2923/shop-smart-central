import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "tyash1864@gmail.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface InquiryPayload {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    product_id: string | null;
    message: string | null;
    status: string;
    created_at: string;
    product?: {
        name: string;
        category: string;
    };
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            console.error("Missing RESEND_API_KEY");
            return new Response(
                JSON.stringify({ error: "Email service not configured" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const resend = new Resend(RESEND_API_KEY);
        const payload: InquiryPayload = await req.json();

        console.log("Received inquiry:", payload);

        const productInfo = payload.product
            ? `<p><strong>Product:</strong> ${payload.product.name} (${payload.product.category})</p>`
            : "";

        const messageText = payload.message
            ? `<p><strong>Message:</strong><br/>${payload.message.replace(/\n/g, "<br/>")}</p>`
            : "";

        const emailHtml = `
      <h2>🔔 New Inquiry Received</h2>
      <p><strong>Customer Name:</strong> ${payload.customer_name}</p>
      <p><strong>Email:</strong> ${payload.customer_email}</p>
      <p><strong>Phone:</strong> ${payload.customer_phone}</p>
      ${productInfo}
      ${messageText}
      <hr/>
      <p><small>Received at: ${new Date(payload.created_at).toLocaleString()}</small></p>
      <p><small>Status: ${payload.status}</small></p>
    `;

        const { data, error } = await resend.emails.send({
            from: "Shop Smart Central <onboarding@resend.dev>", // Change this if you have a verified domain
            to: [ADMIN_EMAIL],
            subject: `New Inquiry from ${payload.customer_name}`,
            html: emailHtml,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Email sent successfully:", data);

        return new Response(JSON.stringify({ success: true, id: data.id }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
};

serve(handler);
