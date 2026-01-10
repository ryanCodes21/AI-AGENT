import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: "content" | "hashtags" | "schedule" | "lead_score" | "chat";
  prompt?: string;
  leadData?: {
    name: string;
    company: string;
    source: string;
    value: number;
  };
  postData?: {
    topic: string;
    platform: string;
    tone?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, leadData, postData } = await req.json() as AIRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "content":
        systemPrompt = `You are a social media content expert. Generate engaging, platform-specific content that drives engagement. Be creative, use emojis appropriately, and keep content concise yet impactful. Return ONLY the post content without any explanations.`;
        userPrompt = postData 
          ? `Create a ${postData.tone || "professional"} social media post for ${postData.platform} about: ${postData.topic}`
          : prompt || "Create an engaging social media post";
        break;

      case "hashtags":
        systemPrompt = `You are a hashtag optimization expert. Generate relevant, trending hashtags that maximize reach and engagement. Return ONLY hashtags separated by spaces, nothing else.`;
        userPrompt = prompt || "Generate trending hashtags for social media marketing";
        break;

      case "schedule":
        systemPrompt = `You are a social media scheduling expert. Analyze the best posting times based on platform and audience engagement patterns. Return a JSON object with recommended times.`;
        userPrompt = postData 
          ? `Suggest optimal posting times for ${postData.platform} for content about ${postData.topic}. Return JSON with format: { "times": ["HH:MM AM/PM"], "days": ["day"], "reason": "explanation" }`
          : "Suggest optimal posting times for maximum engagement";
        break;

      case "lead_score":
        systemPrompt = `You are a sales intelligence expert. Analyze lead data and provide a score from 0-100 based on potential value, engagement likelihood, and conversion probability. Return ONLY a JSON object with score and brief reasoning.`;
        userPrompt = leadData 
          ? `Score this lead: Name: ${leadData.name}, Company: ${leadData.company}, Source: ${leadData.source}, Potential Value: $${leadData.value}. Return JSON: { "score": number, "reason": "brief explanation", "priority": "high/medium/low" }`
          : "Analyze lead potential";
        break;

      case "chat":
        systemPrompt = `You are a helpful AI assistant for social media management. Help users with content ideas, strategy, analytics interpretation, and marketing advice. Be concise and actionable.`;
        userPrompt = prompt || "How can I improve my social media presence?";
        break;

      default:
        throw new Error("Invalid AI request type");
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
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
