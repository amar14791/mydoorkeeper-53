
// Import the serve function from Deno's standard HTTP library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Type definitions
interface ContactFormData {
  name: string;
  email: string;
  societyName?: string;
  numberOfFlats?: string;
  query?: string;
  message: string;
}

interface ResendEmailResponse {
  id?: string;
  error?: {
    message: string;
    statusCode: number;
  };
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
      console.log("Preparing email payload for Resend API");
      
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
      
      // Now using the verified domain for the from address
      const emailPayload = {
        from: "contact@mydoorkeeper.com", // Change to your verified domain email
        to: ["knock@mydoorkeeper.com"], // Change to the desired recipient email
        subject: `New Contact Form Submission from ${formData.name}`,
        html: emailHtml,
        reply_to: formData.email, // Add the user's email as reply-to
      };
      
      console.log("Sending request to Resend API with payload:", JSON.stringify(emailPayload));
      
      // Use fetch API to call Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });
      
      // Log the HTTP status and headers for debugging
      console.log("Resend API response status:", response.status);
      console.log("Resend API response headers:", Object.fromEntries(response.headers.entries()));
      
      // Get the response text first for logging
      const responseText = await response.text();
      console.log("Resend API raw response:", responseText);
      
      // Parse the JSON response if possible
      let responseData: ResendEmailResponse | null = null;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed response data:", responseData);
      } catch (parseError) {
        console.error("Error parsing Resend API response:", parseError);
      }
      
      // Check for HTTP error status
      if (!response.ok) {
        throw new Error(`Resend API HTTP error: ${response.status} - ${responseText || "No response data"}`);
      }
      
      // Check for API error in the response
      if (responseData && responseData.error) {
        throw new Error(`Resend API error: ${JSON.stringify(responseData.error)}`);
      }
      
      console.log("Email sent successfully with ID:", responseData?.id || "unknown");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sent successfully",
          id: responseData?.id
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
