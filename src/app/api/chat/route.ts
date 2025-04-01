import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'

// Giới hạn thời gian xử lý tối đa 30 giây
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // The issue was here - you can only parse the request body once
    // Clone the request first, then parse it
    const body = await req.json()
    const { messages } = body

    console.log({ messages })

    if (!messages) {
      return new Response(JSON.stringify({ error: 'Tin nhắn không được để trống' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await streamText({
      model: openai.chat('gpt-3.5-turbo'),
      messages: messages // Assuming messages is already an array of message objects
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Lỗi OpenAI:', error)
    return new Response(JSON.stringify({ error: 'Lỗi xử lý yêu cầu' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
