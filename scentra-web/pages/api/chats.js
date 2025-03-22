import fs from 'fs'
import path from 'path'

const chatsFilePath = path.join(process.cwd(), 'data', 'chats.json')

export default function handler(req, res) {
  if (req.method === 'GET') {
    const chats = JSON.parse(fs.readFileSync(chatsFilePath, 'utf-8'))
    res.status(200).json(chats)
  } else if (req.method === 'POST') {
    const updatedChat = req.body
    const chats = JSON.parse(fs.readFileSync(chatsFilePath, 'utf-8'))

    // Find the chat by ID and update it
    const chatIndex = chats.findIndex((chat) => chat.id === updatedChat.id)
    if (chatIndex !== -1) {
      chats[chatIndex] = updatedChat
    } else {
      chats.push(updatedChat) // Add as a new chat if not found
    }

    fs.writeFileSync(chatsFilePath, JSON.stringify(chats, null, 2))
    res.status(201).json(chats) // Return the updated list of chats
  } else if (req.method === 'PUT') {
    const updatedChats = req.body
    fs.writeFileSync(chatsFilePath, JSON.stringify(updatedChats, null, 2))
    res.status(200).json({ message: 'Chats updated successfully' })
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
