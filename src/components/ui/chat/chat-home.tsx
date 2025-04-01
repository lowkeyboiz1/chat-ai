'use client'

import type React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useChat } from '@ai-sdk/react'
import { Bot, Loader2, Moon, Paperclip, Send, Sun, Volume2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function ChatHome() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [files, setFiles] = useState<FileList | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  console.log({ messages })
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  // Set initial theme
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files)

      // Create preview for the first image
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      }
    }
  }

  // Clear selected file
  const clearFile = () => {
    setFiles(undefined)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Custom submit handler to include attachments
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input.trim() && !files) return

    handleSubmit(e, {
      experimental_attachments: files
    })

    clearFile()
  }

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Play text to speech
  const playTextToSpeech = async (messageId: string, text: string) => {
    try {
      if (isPlaying[messageId]) {
        // Stop playing
        if (audioRefs.current[messageId]) {
          audioRefs.current[messageId]?.pause()
          setIsPlaying((prev) => ({ ...prev, [messageId]: false }))
        }
        return
      }

      setIsPlaying((prev) => ({ ...prev, [messageId]: true }))

      const response = await fetch('https://api.vapi.ai/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_VAPI_API_KEY}`
        },
        body: JSON.stringify({
          text,
          voice_id: 'eleven_monolingual_v1',
          audio_format: 'mp3'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      if (!audioRefs.current[messageId]) {
        audioRefs.current[messageId] = new Audio(audioUrl)
      } else {
        audioRefs.current[messageId]!.src = audioUrl
      }

      audioRefs.current[messageId]!.onended = () => {
        setIsPlaying((prev) => ({ ...prev, [messageId]: false }))
      }

      audioRefs.current[messageId]!.play()
    } catch (error) {
      console.error('Text-to-speech error:', error)
      setIsPlaying((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = new Date(message.createdAt || Date.now())
      const dateStr = date.toLocaleDateString()

      if (!groups[dateStr]) {
        groups[dateStr] = []
      }

      groups[dateStr].push(message)
      return groups
    },
    {} as Record<string, typeof messages>
  )

  // Handle key press for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form && (input.trim() || files)) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }
  }

  return (
    <div className={cn('flex h-dvh flex-col bg-gradient-to-b', theme === 'dark' ? 'from-gray-900 to-gray-800 text-white' : 'from-blue-50 to-white text-gray-900')}>
      <div className='flex h-full flex-col rounded-none border-none bg-transparent'>
        <div className={cn('flex items-center justify-between border-b px-4 py-2 backdrop-blur-sm', theme === 'dark' ? 'border-gray-700 bg-gray-900/80' : 'border-gray-200 bg-white/80')}>
          <div className='flex items-center gap-2'>
            <Bot className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
            <span>AI Chat Assistant</span>
            <Badge variant='outline' className='ml-2 text-xs'>
              {isLoading ? 'Thinking...' : 'Online'}
            </Badge>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' onClick={toggleTheme} className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span className='sr-only'>Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <ScrollArea className='h-full min-h-[calc(100dvh-130px)] flex-1 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-yellow-500/10 shadow-[0_0_35.4px_0_#4c4ddd]'>
          <div className={cn('h-full min-h-[calc(100dvh-130px)] flex-1 space-y-4 p-4', theme === 'dark' ? 'bg-gray-900/30' : 'bg-white/30')}>
            {Object.keys(groupedMessages).length === 0 && (
              <div className='flex h-full flex-col items-center justify-center space-y-4 py-12'>
                <div className={cn('rounded-full p-4', theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50')}>
                  <Bot className={cn('h-12 w-12', theme === 'dark' ? 'text-blue-400' : 'text-blue-600')} />
                </div>
                <div className='space-y-2 text-center'>
                  <h3 className='text-lg font-medium'>Welcome to AI Chat Assistant</h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Start a conversation or try these examples:</p>
                  <div className='flex flex-wrap justify-center gap-2 pt-2'>
                    {['Explain quantum computing', 'Write a poem about nature', 'Help me debug my code'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant='outline'
                        size='sm'
                        className={theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}
                        onClick={() => handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <div className='relative my-4'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className={cn('w-full border-t', theme === 'dark' ? 'border-gray-700' : 'border-gray-200')} />
                  </div>
                  <div className='relative flex justify-center'>
                    <span className={cn('px-2 text-xs', theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500')}>
                      {new Date(date).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {dateMessages.map((msg, index) => {
                  const isUser = msg.role === 'user'
                  const showAvatar = index === 0 || dateMessages[index - 1].role !== msg.role
                  console.log({ msg })
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'animate-fadeIn flex w-full items-start gap-2 transition-all duration-300 ease-in-out',
                        isUser ? 'justify-end' : 'justify-start',
                        !showAvatar && isUser ? 'pr-10' : '',
                        !showAvatar && !isUser ? 'pl-10' : ''
                      )}
                    >
                      {!isUser && showAvatar && (
                        <Avatar className='mt-1 h-8 w-8'>
                          <AvatarFallback className='bg-blue-600'>AI</AvatarFallback>
                          <AvatarImage src='/placeholder.svg?height=32&width=32' />
                        </Avatar>
                      )}

                      <div className='flex max-w-[80%] flex-col'>
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-3',
                            isUser
                              ? 'rounded-br-none border-[#abacff] bg-[#c4a3ff1a] text-white'
                              : theme === 'dark'
                                ? 'rounded-bl-none border-[#8f67ff] bg-[#602af8]/10 text-gray-100 shadow-[0_0_4px_0_#602af8]'
                                : 'rounded-bl-none bg-gray-100 text-gray-800'
                          )}
                        >
                          <div className='flex justify-between'>
                            <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />

                            {!isUser && (
                              <Button variant='ghost' size='icon' className='ml-2 h-6 w-6 shrink-0 self-start' onClick={() => playTextToSpeech(msg.id, msg.content)}>
                                <Volume2 className={cn('h-4 w-4', isPlaying[msg.id] ? 'text-blue-400' : 'text-gray-400')} />
                              </Button>
                            )}
                          </div>

                          {/* Display attachments if any */}
                          {msg.experimental_attachments
                            // @ts-ignore
                            ?.filter((att) => att.contentType.startsWith('image/'))
                            .map((attachment, i) => (
                              <div key={`${msg.id}-attachment-${i}`} className='mt-2'>
                                <img src={attachment.url || '/placeholder.svg'} alt={attachment.name || 'Attachment'} className='max-h-60 rounded-md object-contain' />
                              </div>
                            ))}
                        </div>
                        <span className={cn('mt-1 mb-3 px-2 text-xs', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>{formatTimestamp(new Date(msg.createdAt || Date.now()))}</span>
                      </div>

                      {isUser && showAvatar && (
                        <Avatar className='mt-1 h-8 w-8'>
                          <AvatarFallback className='bg-green-600'>U</AvatarFallback>
                          <AvatarImage src='/placeholder.svg?height=32&width=32' />
                        </Avatar>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

            {error && (
              <div className='rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400'>
                <p>Error: {error.message || 'Something went wrong. Please try again.'}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className={cn('border-t p-4 backdrop-blur-sm', theme === 'dark' ? 'border-gray-700 bg-gray-900/80' : 'border-gray-200 bg-white/80')}>
          {previewUrl && (
            <div className='absolute bottom-20 left-4 rounded-md bg-gray-800 p-2'>
              <div className='relative h-20 w-20'>
                <img src={previewUrl || '/placeholder.svg'} alt='Preview' className='h-full w-full rounded object-cover' />
                <Button variant='destructive' size='icon' className='absolute -top-2 -right-2 h-5 w-5 rounded-full p-0' onClick={clearFile}>
                  <X className='h-3 w-3' />
                  <span className='sr-only'>Remove image</span>
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className='flex w-full gap-2'>
            <input type='file' ref={fileInputRef} onChange={handleFileChange} className='hidden' accept='image/*' />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    size='icon'
                    variant='outline'
                    className={theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className='h-4 w-4' />
                    <span className='sr-only'>Attach file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach an image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Textarea
              className={cn(
                'max-h-[120px] min-h-[40px] flex-1 resize-none py-2 shadow-[0_0_20px_0_#4c4ddd]',
                theme === 'dark' ? 'border-gray-700 bg-gray-800 text-white focus-visible:ring-0' : 'border-gray-200 bg-white text-gray-900 focus-visible:ring-0'
              )}
              value={input}
              onChange={handleInputChange as React.ChangeEventHandler<HTMLTextAreaElement>}
              placeholder='Type your message... (Shift+Enter for new line)'
              onKeyDown={handleKeyDown}
              rows={3}
            />

            <Button type='submit' disabled={isLoading || (!input.trim() && !files)} className={cn('text-white', theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')}>
              {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
              <span className='sr-only'>Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
