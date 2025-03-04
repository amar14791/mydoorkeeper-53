
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
      throw new Error("Email service configuration error. Missing API key.");
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
      throw new Error("Invalid request format");
    }

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      throw new Error("Missing required fields: name, email, and message are required");
    }

    try {
      console.log("Attempting to send email...");
      const emailResponse = await resend.emails.send({
        from: "noreply@mydoorkeeper.com", 
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
      throw new Error(`Failed to send email: ${emailError.message}`);
    }
  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred"
      }),
      { headers, status: 400 }
    );
  }
});
