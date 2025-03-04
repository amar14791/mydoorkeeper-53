
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
    // Initialize Resend with API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("Email service configuration is missing");
    }
    
    const resend = new Resend(resendApiKey);
    console.log("Resend initialized successfully");

    // Parse and validate form data
    let formData: ContactFormData;
    try {
      formData = await req.json();
      console.log("Parsed form data:", formData);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Invalid request format");
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      throw new Error("Missing required fields");
    }

    try {
      console.log("Attempting to send email...");
      const emailResponse = await resend.emails.send({
        from: "noreply@mydoorkeeper.com", // Use a domain you own and verified in Resend
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

      console.log("Email response from Resend:", emailResponse);

      return new Response(JSON.stringify({
        success: true,
        message: "Email sent successfully",
        data: emailResponse
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (emailError: any) {
      console.error("Resend email error:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }
  } catch (error: any) {
    console.error("Error in send-contact-form function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
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
