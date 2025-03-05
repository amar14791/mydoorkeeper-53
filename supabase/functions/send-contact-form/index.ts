
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.0.0";

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
  
  // Set up CORS headers as a plain object, not with Headers constructor
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
      // Initialize Resend with the API key - using a different approach
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
      
      // Send the email with a simple payload
      const emailResponse = await resend.emails.send({
        from: "onboarding@resend.dev", // Always use this until your domain is verified
        to: ["knock@mydoorkeeper.com"],
        subject: `New Contact Form Submission from ${formData.name}`,
        html: emailHtml,
      });

      console.log("Email sending attempt complete, response:", JSON.stringify(emailResponse));
      
      // Check for errors in emailResponse
      if (emailResponse.error) {
        throw new Error(`Email sending failed: ${JSON.stringify(emailResponse.error)}`);
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
      console.error("Error sending email:", emailError.message || "Unknown email error");
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
    console.error("Function error:", error.message || "Unknown error");
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
