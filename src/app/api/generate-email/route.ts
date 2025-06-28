import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai"
import fs from 'fs'
import path from 'path'

// Initialize the Gemini client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_API_KEY || "" 
})

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json()

    if (!userInput) {
      return NextResponse.json(
        { error: 'Missing userInput' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Read prompt files
    const agentPrompt = fs.readFileSync(path.join(process.cwd(), 'public/prompt/agent_prompt.md'), 'utf8')
    const officerPrompt = fs.readFileSync(path.join(process.cwd(), 'public/prompt/officer_prompt.md'), 'utf8')
    const monkeyPrompt = fs.readFileSync(path.join(process.cwd(), 'public/prompt/monkey_prompt.md'), 'utf8')

    // Generate all three emails in parallel
    const [agentResponse, officerResponse, monkeyResponse] = await Promise.all([
      generateEmailWithPrompt(agentPrompt, userInput),
      generateEmailWithPrompt(officerPrompt, userInput),
      generateEmailWithPrompt(monkeyPrompt, userInput)
    ])

    return NextResponse.json({
      agentInitialEmail: agentResponse,
      officerInitialEmail: officerResponse,
      monkeyInitialEmail: monkeyResponse,
      success: true
    })

  } catch (error) {
    console.error("Error generating emails with Gemini:", error)
    return NextResponse.json(
      { 
        agentInitialEmail: { subject: "Error", body: "Failed to generate agent email" },
        officerInitialEmail: { subject: "Error", body: "Failed to generate officer email" },
        monkeyInitialEmail: { subject: "Error", body: "Failed to generate monkey email" },
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

async function generateEmailWithPrompt(prompt: string, userInput: string) {
  const fullPrompt = `${prompt}

User's sad content/idea: "${userInput}"

Please write a professional email based on the user's content. The email should:
1. Have a clear, professional subject line
2. Follow the character's personality and style
3. Be well-formatted and appropriate for business communication
4. Transform the user's sad content into a proper email

Format your response as JSON with "subject" and "body" fields.`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
    config: {
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 0, // Disable thinking for faster response
      },
    },
  })

  const responseText = response.text || ""
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(responseText)
    if (parsed.subject && parsed.body) {
      return {
        subject: parsed.subject,
        body: parsed.body
      }
    }
  } catch {
    // If JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        if (parsed.subject && parsed.body) {
          return {
            subject: parsed.subject,
            body: parsed.body
          }
        }
      } catch {
        // Continue to fallback
      }
    }
    
    // If JSON parsing fails, extract subject and body manually
    const lines = responseText.split('\n').filter(line => line.trim())
    
    // Look for subject and body patterns
    let subject = 'Email'
    let body = responseText
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (line.includes('subject:') || line.includes('"subject"')) {
        subject = lines[i].replace(/.*subject:?\s*/i, '').replace(/^["']|["']$/g, '').replace(/^.*"subject"\s*:\s*["']?([^"']+)["']?.*$/, '$1')
        body = lines.slice(i + 1).join('\n')
        break
      }
    }
    
    return {
      subject: subject || "Email",
      body: body || responseText
    }
  }

  // Fallback: return the raw response
  return {
    subject: "Email",
    body: responseText
  }
} 