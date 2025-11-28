"use client"

import ReactMarkdown from "react-markdown"
import type React from "react"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, X, AlertTriangle, Phone, Heart, Smile } from "lucide-react"
 


interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  crisisDetected?: boolean
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

interface CrisisChatbotProps {
  onStartAssessment: (type: "anxiety" | "depression" | "stress") => void
  onNavigateTo: (tab: "mood" | "resources") => void;
}


const crisisKeywords = [
  "suicide",
  "kill myself",
  "end it all",
  "not worth living",
  "better off dead",
  "self-harm",
  "hurt myself",
  "cut myself",
  "worthless",
  "hopeless",
  "can't go on",
  "want to die",
  "no point",
  "give up",
  "overdose",
]

const supportiveResponses = [
  "I'm really glad you reached out. Your feelings are valid, and you don't have to go through this alone.",
  "It takes courage to share what you're going through. I'm here to listen and support you.",
  "Thank you for trusting me with your feelings. Let's work through this together.",
  "I hear you, and I want you to know that there are people who care about you and want to help.",
  "You've taken an important step by talking about this. How are you feeling right now?",
]

const crisisResponse =
  "I'm very concerned about what you've shared. Your life has value, and there are people who want to help you right now. Please consider reaching out to a crisis counselor immediately."

export function CrisisChatbot({ onStartAssessment, onNavigateTo }: CrisisChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const initialBotGreeting =
    "Hi there! I'm your MindSpace assistant. I'm here to help. What would you like to do?"
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: initialBotGreeting,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "assistant", content: initialBotGreeting },
  ])
  const [inputValue, setInputValue] = useState("")
  const [crisisDetected, setCrisisDetected] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [activeUserEmail, setActiveUserEmail] = useState<string | null>(null)
  const [showInitialOptions, setShowInitialOptions] = useState(true)
  const [moodTrackingState, setMoodTrackingState] = useState<{
    active: boolean
    step: "selecting_mood" | "writing_note" | "complete"
    mood: string | null
  }>({ active: false, step: "selecting_mood", mood: null })

  const [assessmentState, setAssessmentState] = useState<{
    active: boolean
    step: "selecting_type" | "in_progress"
    type: "anxiety" | "depression" | "stress" | null
    questions: string[]
    answers: any
    currentIndex: number
  }>({ active: false, step: "selecting_type", type: null, questions: [], answers: {}, currentIndex: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const resetChat = () => {
    setMessages([
      {
        id: "1",
        text: initialBotGreeting,
        sender: "bot",
        timestamp: new Date(),
      },
    ])
    setChatHistory([{ role: "assistant", content: initialBotGreeting }])
    setCrisisDetected(false)
    setInputValue("")
    setShowEmojiPicker(false)
    setIsThinking(false)
    setShowInitialOptions(true)
    setMoodTrackingState({ active: false, step: "selecting_mood", mood: null, })
    setAssessmentState({ active: false, step: "selecting_type", type: null, questions: [], answers: {}, currentIndex: 0 })
  }

  // Effect to check for user change when chat is opened
  useEffect(() => {
    if (isOpen) {
      const raw = localStorage.getItem("mindspace-user")
      const storedUser = raw ? JSON.parse(raw) : null
      const currentUserEmail = storedUser?.email ?? null

      if (activeUserEmail !== currentUserEmail) {
        resetChat()
        setActiveUserEmail(currentUserEmail)
      }
      // Always show options on open, unless an assessment or mood tracking is active
      if (!assessmentState.active && !moodTrackingState.active) {
        setShowInitialOptions(true)
      }
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const detectCrisis = (text: string): boolean => {
    const lowerText = text.toLowerCase()
    return crisisKeywords.some((keyword) => lowerText.includes(keyword))
  }

  const getBotResponse = (userMessage: string, isCrisis: boolean): string => {
    if (isCrisis) {
      return crisisResponse
    }

    // Simple response logic - in a real app, this would use AI
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
      return "Anxiety can feel overwhelming. Try taking slow, deep breaths. What's making you feel anxious right now?"
    }

    if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
      return "I'm sorry you're feeling this way. Depression can make everything feel harder. What's been weighing on your mind?"
    }

    if (lowerMessage.includes("stressed") || lowerMessage.includes("overwhelmed")) {
      return "Stress can be really challenging to manage. What's causing you the most stress right now? Sometimes talking through it can help."
    }

    if (lowerMessage.includes("lonely") || lowerMessage.includes("alone")) {
      return "Feeling lonely is really difficult. You're not alone in feeling this way. What would help you feel more connected right now?"
    }

    // Default supportive response
    return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)]
  }

  const handleAssessmentAnswer = async (answerValue: string) => {
    const { currentIndex, questions, type, answers } = assessmentState
    const newAnswers = { ...answers, [`q${currentIndex}`]: answerValue }

    // Add user's answer as a message
    const answerMessage: Message = {
      id: Date.now().toString(),
      text: `Answer: ${answerValue}`, // Or you could use the label
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, answerMessage])

    if (currentIndex < questions.length - 1) {
      // Ask next question
      const nextIndex = currentIndex + 1
      const nextQuestion = questions[nextIndex]
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: nextQuestion,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setAssessmentState((prev) => ({ ...prev, currentIndex: nextIndex, answers: newAnswers }))
    } else {
      // End of assessment, submit results
      setIsThinking(true)
      const response = await fetch(`http://localhost:5000/assessment/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeUserEmail, answers: newAnswers }),
      })
      const result = await response.json()
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Assessment Complete! ${result.result}`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, resultMessage])

      // Reset assessment state and show initial options again
      setAssessmentState({ active: false, step: "selecting_type", type: null, questions: [], answers: {}, currentIndex: 0 })
      setShowInitialOptions(true)
      setIsThinking(false)
    }
  }

  const handleMoodSelect = (mood: string, label: string) => {
    // Add user's choice as a message
    const moodMessage: Message = {
      id: Date.now().toString(),
      text: `I'm feeling: ${label}`,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, moodMessage])

    // Update state and ask for a note
    setMoodTrackingState({ active: true, step: "writing_note", mood: mood })

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thank you for sharing. Would you like to add a note about why you're feeling this way? (You can also type 'skip')",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, botMessage])
  }

  const moodOptions = [
    { emoji: "😊", label: "Great", value: "great" },
    { emoji: "🙂", label: "Good", value: "good" },
    { emoji: "😐", label: "Okay", value: "okay" },
    { emoji: "😔", label: "Low", value: "low" },
    { emoji: "😢", label: "Struggling", value: "struggling" },
  ]

 const handleSendMessage = async () => {
  if (!inputValue.trim()) return

  const isCrisis = detectCrisis(inputValue)

  const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
      crisisDetected: isCrisis,
    }

    // Handle mood note submission
    if (moodTrackingState.active && moodTrackingState.step === "writing_note") {
      const note = inputValue.trim().toLowerCase() === "skip" ? "" : inputValue.trim()
      const mood = moodTrackingState.mood

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")
      setIsThinking(true)

      await fetch("http://localhost:5000/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: activeUserEmail, mood, note, entry_date: new Date().toISOString().slice(0, 10) }),
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Your mood has been logged. Thank you for checking in with yourself.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setMoodTrackingState({ active: false, step: "selecting_mood", mood: null })
      setShowInitialOptions(true) // Show main menu again
      setIsThinking(false)
      return // Stop further processing
    }

  setMessages((prev) => [...prev, userMessage])
  if (isCrisis) setCrisisDetected(true)

  // Update chat history for backend context
  const newHistory: ChatMessage[] = [...chatHistory, { role: "user", content: inputValue }]
  setChatHistory(newHistory)

  setInputValue("")

  setShowInitialOptions(false) // Hide options once user sends a message
  setIsThinking(true)

    try {
    // Attempt to read logged-in user from localStorage (if available)
    let storedUser = null
    try {
      const raw = localStorage.getItem("mindspace-user")
      storedUser = raw ? JSON.parse(raw) : null
    } catch (e) {
      storedUser = null
    }

    const payload: any = { messages: newHistory }
    if (storedUser) {
      // include lightweight identifier for server-side logging/association
      payload.email = storedUser.email ?? null
    }

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    console.log("Sending:", newHistory)

    const data = await res.json()
    // Be tolerant to backend response shape: {response} or {reply}

    // Check for an action from the backend
    if (data.action) {
      setIsThinking(false)
      setIsOpen(false) // Close chat to show the main UI change
      if (data.action === "start_assessment") {
        const args = JSON.parse(data.arguments)
        onStartAssessment(args.assessment_type)
      } else if (data.action === "track_mood") {
        onNavigateTo("mood")
      } else if (data.action === "show_resources") {
        onNavigateTo("resources")
      }
      return // Stop further processing
    }


    const botText: string = (data && (data.response ?? data.reply)) || getBotResponse(userMessage.text, isCrisis)


    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botText,
      sender: "bot",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
    setChatHistory((prev) => [...prev, { role: "assistant", content: botText }])
    setIsThinking(false)
  } catch (error) {
    console.error("Error sending message:", error)
    const errorMessage: Message = {
      id: (Date.now() + 2).toString(),
      text: "Sorry, something went wrong. Please try again.",
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, errorMessage])
    setIsThinking(false)
  }
}


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAssessmentTypeSelect = async (assessmentType: "anxiety" | "depression" | "stress") => {
    // Start assessment inside the chat
    setIsThinking(true)
    const response = await fetch(`http://localhost:5000/assessment/questions/${assessmentType}`)
    if (response.ok) {
      const data = await response.json()
      const questions = data.questions
      const firstQuestion = questions[0]

      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Starting the ${assessmentType} assessment. Over the last 2 weeks, how often have you been bothered by the following?\n\n**${firstQuestion}**`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])

      setAssessmentState({
        active: true,
        step: "in_progress",
        type: assessmentType,
        questions: questions,
        answers: {},
        currentIndex: 0,
      })
    }
    setIsThinking(false)
  }

  const handleOptionClick = async (option: "mood" | "assessment" | "resources" | "talk") => {
    setShowInitialOptions(false)

    if (option === "resources") {
      setIsOpen(false)
      onNavigateTo("resources")
    } else if (option === "mood") {
      setMoodTrackingState({ active: true, step: "selecting_mood", mood: null, })
    } else if (option === "assessment") {
      // Move to the assessment type selection step
      setAssessmentState((prev) => ({ ...prev, active: true, step: "selecting_type" }))
    }
    // If "talk", do nothing, just hide options and allow user to type
  }
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <Card
            className="w-[90vw] max-w-xl h-[80vh] max-h-[700px] flex flex-col shadow-xl bg-[oklch(0.97_0.02_150)]"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3  text-white rounded-t-lg" style={{ backgroundColor: "oklch(0.78 0.13 13.5)", paddingTop:"20px" }}>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                <CardTitle className="text-lg">MindSpace Support</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-transparent hover:text-white/80"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            {crisisDetected && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Crisis Support Available</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    Call 988
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs border-red-300 bg-transparent hover:bg-red-100">
                    Chat with Counselor
                  </Button>
                </div>
              </div>
            )}

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user" ? "bg-[oklch(0.78_0.13_13.5)] text-white" : "bg-[#ffffff75] text-gray-900"
                      }`}
                    >
                      {message.sender === "bot" ? (
                        <div className="prose prose-sm max-w-none text-gray-900">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                      {message.crisisDetected && (
                        <Badge variant="destructive" className="mt-2 text-xs">
                          Crisis keywords detected
                        </Badge>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div
                      className={`max-w-[80%] p-3 rounded-lg`}
                    >
                      <p className="text-sm text-gray-500">
                        <i>Thinking...</i>
                      </p>
                    </div>
                  </div>
                )}
                {showInitialOptions && !assessmentState.active && !moodTrackingState.active && (
                  <div className="p-4 space-y-2 animate-in fade-in duration-500">
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-transparent"
                      onClick={() => handleOptionClick("mood")}
                    >
                      Track my mood
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-transparent"
                      onClick={() => handleOptionClick("assessment")}
                    >
                      Take a self-assessment
                    </Button>
                    <Button variant="outline" className="w-full justify-start hover:bg-transparent" onClick={() => handleOptionClick("talk")}>
                      I just want to talk
                    </Button>
                  </div>
                )}
                {moodTrackingState.active && moodTrackingState.step === "selecting_mood" && (
                  <div className="p-4 grid grid-cols-3 gap-2 animate-in fade-in duration-500">
                    {moodOptions.map((mood) => (
                      <Button
                        key={mood.value}
                        variant="outline"
                        className="flex flex-col h-auto py-2"
                        onClick={() => handleMoodSelect(mood.value, mood.label)}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs">{mood.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
                {assessmentState.active && assessmentState.step === 'selecting_type' && (
                  <div className="p-4 space-y-2 animate-in fade-in duration-500">
                    <p className="text-sm text-muted-foreground text-center mb-2">Which assessment would you like to take?</p>
                    <Button variant="outline" className="w-full" onClick={() => handleAssessmentTypeSelect("anxiety")}>
                      Anxiety (GAD-7)
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleAssessmentTypeSelect("depression")}>
                      Depression (PHQ-9)
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleAssessmentTypeSelect("stress")}>
                      Stress
                    </Button>
                  </div>
                )}
                {assessmentState.active && assessmentState.step === 'in_progress' && (
                  <div className="p-4 space-y-2 animate-in fade-in duration-500">
                    <p className="text-sm text-muted-foreground text-center mb-2">Please select an answer:</p>
                    <Button variant="outline" className="w-full hover:bg-transparent" onClick={() => handleAssessmentAnswer("0")}>
                      Not at all
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-transparent" onClick={() => handleAssessmentAnswer("1")}>
                      Several days
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-transparent" onClick={() => handleAssessmentAnswer("2")}>
                      More than half the days
                    </Button>
                    <Button variant="outline" className="w-full hover:bg-transparent" onClick={() => handleAssessmentAnswer("3")}>
                      Nearly every day
                    </Button>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fixed Input */}
              <div
                className={`border-t p-4 flex gap-2 flex-shrink-0 relative ${
                  ( (assessmentState.active && assessmentState.step === 'in_progress') ||
                    (moodTrackingState.active && moodTrackingState.step === "selecting_mood") ||
                    (assessmentState.active && assessmentState.step === 'selecting_type')
                  ) ? "hidden" : ""
                }`}
              >
                {showEmojiPicker && (
                  <div className="absolute bottom-16 right-4">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border-2 border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[oklch(0.78_0.13_13.5)]"
                  onClick={() => showEmojiPicker && setShowEmojiPicker(false)}
                />
                <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:bg-transparent">
                  <Smile className="h-5 w-5" />
                  <span className="sr-only">Open emoji picker</span>
                </Button>
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
