import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: string;
  prompt?: string;
  leadData?: any;
  postData?: any;
  recordData?: any;
  businessData?: any;
  messageData?: any;
  businessContext?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json() as AIRequest;
    const { type, prompt, leadData, postData, recordData, businessData, messageData, businessContext } = requestData;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "content":
        systemPrompt = `You are a social media content expert. Generate engaging, platform-specific content. Be creative, use emojis. Return ONLY the post content.`;
        userPrompt = postData 
          ? `Create a ${postData.tone || "professional"} social media post for ${postData.platform} about: ${postData.topic}`
          : prompt || "Create an engaging social media post";
        break;

      case "hashtags":
        systemPrompt = `You are a hashtag optimization expert. Generate relevant, trending hashtags. Return ONLY hashtags separated by spaces.`;
        userPrompt = prompt || "Generate trending hashtags for social media marketing";
        break;

      case "lead_score":
        systemPrompt = `You are a sales intelligence expert. Score leads from 0-100 based on value and conversion probability. Return JSON: { "score": number, "reason": "brief explanation", "priority": "high/medium/low" }`;
        userPrompt = leadData 
          ? `Score this lead: Name: ${leadData.name}, Company: ${leadData.company}, Source: ${leadData.source}, Value: $${leadData.value}`
          : "Analyze lead potential";
        break;

      case "record_analysis":
        systemPrompt = `You are a business analyst. Analyze business records and provide actionable insights in 2-3 sentences. Focus on optimization, cost savings, or growth opportunities.`;
        userPrompt = recordData 
          ? `Analyze: Type: ${recordData.type}, Title: ${recordData.title}, Description: ${recordData.description || "N/A"}, Amount: $${recordData.amount || 0}, Category: ${recordData.category || "N/A"}`
          : "Analyze business record";
        break;

      case "extract_lead":
        systemPrompt = `You are a data extraction expert. Extract contact information from social media messages. Return JSON with name, phone, email if found.`;
        userPrompt = messageData 
          ? `Extract contact info from this ${messageData.platform} message: "${messageData.content}". Contact name: ${messageData.contactName || "Unknown"}`
          : "Extract lead information";
        break;

      case "generate_campaign":
        systemPrompt = `You are a marketing strategist. Generate a comprehensive campaign strategy including name, description, target audience, and platform recommendations. Keep it concise but actionable.`;
        userPrompt = businessData 
          ? `Create a campaign for a ${businessData.industry} business with goals: ${businessData.goals?.join(", ")}`
          : "Generate a marketing campaign";
        break;

      case "swot_analysis":
        systemPrompt = `You are a business strategist. Perform a SWOT analysis. Return JSON: { "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."] }. Each array should have 3-5 items.`;
        userPrompt = businessData 
          ? `SWOT for: ${businessData.followers} followers, ${businessData.engagementRate}% engagement, platforms: ${businessData.platforms?.join(", ")}, industry: ${businessData.industry}`
          : "Perform SWOT analysis for a growing business";
        break;

      case "business_consultant":
        const context = businessContext || {};
        systemPrompt = `You are an expert business consultant specializing in campaign generation, business management, and growth strategies. ${context.name ? `The business is ${context.name}` : ""} ${context.location ? `located in ${context.location}` : ""} ${context.industry ? `in the ${context.industry} industry` : ""}. Provide specific, actionable advice. Be concise but thorough. Format responses with clear sections when appropriate.`;
        userPrompt = prompt || "How can I grow my business?";
        break;

      default:
        systemPrompt = `You are a helpful AI assistant for business and social media management. Be concise and actionable.`;
        userPrompt = prompt || "How can I help you today?";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Please add credits to continue using AI features." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ content, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});