
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  societyName: string;
  numberOfFlats: string;
  query: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Request received:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log the raw request body
    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);

    // Parse the JSON body
    const formData: ContactFormData = JSON.parse(rawBody);
    console.log("Parsed form data:", formData);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      throw new Error("Missing required fields");
    }

    // Log Resend API key presence (don't log the actual key!)
    const hasResendKey = !!Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key present:", hasResendKey);

    const emailResponse = await resend.emails.send({
      from: "MyDoorKeeper <onboarding@resend.dev>",
      to: ["knock@mydoorkeeper.com"],
      subject: `New Contact Form Submission from ${formData.name}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <h2>Contact Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${formData.name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Society Name:</strong> ${formData.societyName}</li>
          <li><strong>Number of Flats:</strong> ${formData.numberOfFlats}</li>
          <li><strong>Query Type:</strong> ${formData.query}</li>
        </ul>
        <h2>Message:</h2>
        <p>${formData.message}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-form function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
      }
    );
  }
};

serve(handler);
