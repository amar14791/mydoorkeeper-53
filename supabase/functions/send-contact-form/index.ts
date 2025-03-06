
// Import the serve function from Deno's standard HTTP library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Import Resend using a specific ESM.sh URL that includes Deno compatibility
import { Resend } from "https://esm.sh/@resend/node@0.5.2";

// Type definitions
interface ContactFormData {
  name: string;
  email: string;
  societyName?: string;
  numberOfFlats?: string;
  query?: string;
  message: string;
}

// Handle HTTP requests
serve(async (req) => {
  console.log("Received request to send-contact-form function");
  
  // Set up CORS headers as a plain object
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the RESEND_API_KEY from environment variables
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY available:", !!RESEND_API_KEY);
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in environment variables.");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service configuration error. Missing API key." 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Parse and validate form data
    let formData: ContactFormData;
    try {
      formData = await req.json();
      console.log("Parsed form data:", formData);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      console.error("Missing required fields in form data");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: name, email, and message are required" 
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    try {
      console.log("Initializing Resend with API key");
      // Initialize the Resend client
      const resend = new Resend(RESEND_API_KEY);
      
      console.log("Preparing to send email...");
      
      // Create email content
      const emailHtml = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        ${formData.societyName ? `<p><strong>Society Name:</strong> ${formData.societyName}</p>` : ''}
        ${formData.numberOfFlats ? `<p><strong>Number of Flats:</strong> ${formData.numberOfFlats}</p>` : ''}
        ${formData.query ? `<p><strong>Query Type:</strong> ${formData.query}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
      `;
      
      // Simplified email sending configuration
      const emailData = {
        from: "onboarding@resend.dev",
        to: ["knock@mydoorkeeper.com"],
        subject: `New Contact Form Submission from ${formData.name}`,
        html: emailHtml,
      };
      
      console.log("Sending email with data:", JSON.stringify(emailData));
      
      // Send the email using a more Deno-compatible approach
      const { data, error } = await resend.emails.send(emailData);
      
      console.log("Email sending completed - data:", data, "error:", error);
      
      if (error) {
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully" 
        }),
        { 
          headers: corsHeaders, 
          status: 200 
        }
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailError.message || "Unknown error"}` 
        }),
        { 
          headers: corsHeaders, 
          status: 500 
        }
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { 
        headers: corsHeaders, 
        status: 500 
      }
    );
  }
});
