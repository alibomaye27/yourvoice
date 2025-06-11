import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional job description writer. You will be given a brief description of a job, and you need to generate a complete job posting with the following sections:

          Required fields:
          - title (string): The job title
          - company (string): Company name if provided in prompt, otherwise leave empty
          - department (string): Department name based on the role
          - location (string): Location if provided in prompt, otherwise suggest a suitable location
          - employment_type (string, one of: "full-time", "part-time", "contract", "internship"): Based on the role
          - experience_level (string, one of: "entry", "mid", "senior", "executive"): Based on the role
          - description (string): Detailed overview of the position
          - salary_range_min (number): Suggested minimum salary in USD
          - salary_range_max (number): Suggested maximum salary in USD
          - application_deadline (string in YYYY-MM-DD format): Set to 30 days from today
          - requirements (array of strings): Minimum qualifications
          - responsibilities (array of strings): Key duties
          - skills_required (array of strings): Technical and soft skills
          - benefits (array of strings): Compensation and perks
          - certifications_required (array of strings): Required certifications

          Format your response as a JSON object with these exact keys.
          Keep each array item concise and focused on a single point.
          Ensure the content is professional and aligned with industry standards.
          Make the content compelling and attractive to potential candidates.
          For salary ranges, ensure they are realistic and competitive for the role and location.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })

    const generatedContent = JSON.parse(completion.choices[0].message.content)

    return NextResponse.json(generatedContent)
  } catch (error) {
    console.error('Error generating job details:', error)
    return NextResponse.json(
      { error: 'Failed to generate job details' },
      { status: 500 }
    )
  }
} 