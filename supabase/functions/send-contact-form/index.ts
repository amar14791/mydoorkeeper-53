
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
  
  // Set up CORS headers
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  });

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }

  try {
    // Get the RESEND_API_KEY from environment variables
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in environment variables.");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email service configuration error. Missing API key." 
        }),
        { headers, status: 500 }
      );
    }
    
    // Initialize Resend with the API key
    const resend = new Resend(RESEND_API_KEY);
    console.log("Resend initialized successfully");

    // Parse and validate form data
    let formData: ContactFormData;
    try {
      formData = await req.json();
      console.log("Parsed form data:", formData);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid request format" }),
        { headers, status: 400 }
      );
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: name, email, and message are required" 
        }),
        { headers, status: 400 }
      );
    }

    try {
      console.log("Attempting to send email...");
      
      // Test the Resend configuration first
      const testEmailResponse = await resend.emails.send({
        from: "onboarding@resend.dev", // Use Resend's default domain for testing
        to: ["knock@mydoorkeeper.com"],
        subject: "Testing Resend Configuration",
        html: "<p>This is a test email to verify Resend configuration.</p>",
      });
      
      console.log("Test email response:", testEmailResponse);
      
      if (testEmailResponse.error) {
        throw new Error(`Test email failed: ${testEmailResponse.error.message || "Unknown error"}`);
      }
      
      // If test email works, send the actual email
      const emailResponse = await resend.emails.send({
        from: "onboarding@resend.dev", // Use Resend's default domain until yours is verified
        to: ["knock@mydoorkeeper.com"],
        subject: `New Contact Form Submission from ${formData.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          ${formData.societyName ? `<p><strong>Society Name:</strong> ${formData.societyName}</p>` : ''}
          ${formData.numberOfFlats ? `<p><strong>Number of Flats:</strong> ${formData.numberOfFlats}</p>` : ''}
          ${formData.query ? `<p><strong>Query Type:</strong> ${formData.query}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p>${formData.message.replace(/\n/g, '<br>')}</p>
        `,
      });

      console.log("Email sent successfully:", emailResponse);
      
      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        { headers, status: 200 }
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailError.message || "Unknown error"}` 
        }),
        { headers, status: 500 }
      );
    }
  } catch (error) {
    console.error("Function error:", error.message || "Unknown error");
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      { headers, status: 500 }
    );
  }
});
