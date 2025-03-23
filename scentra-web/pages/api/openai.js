import { Configuration, OpenAIApi } from 'openai'

// const configuration = new Configuration({
//   apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY // Ensure this environment variable is set
// })

const openai = new OpenAIApi()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { messages } = req.body
    console.log('MESSAGES: ', messages)

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // Use a valid model name
      messages
    })

    const content = completion.data.choices[0]?.message?.content || ''
    res.status(200).json({ content })
  } catch (error) {
    console.error('Error with OpenAI API:', error)
    res.status(500).json({ error: 'Failed to connect to OpenAI API' })
  }
}
