import { Button } from '@/components/ui/button'
import { Character } from '@/types/game'
import { EmailContent } from '@/lib/gemini'
import { useState, useEffect } from 'react'

interface WritingScreenProps {
  selectedCharacter: Character | null
  generatedEmail: EmailContent | null
  isGeneratingEmail: boolean
  onSendEmail: (editedEmail: EmailContent) => void
}

export function WritingScreen({ 
  selectedCharacter, 
  generatedEmail, 
  isGeneratingEmail, 
  onSendEmail 
}: WritingScreenProps) {
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')

  // Initialize edited content when generatedEmail changes
  useEffect(() => {
    if (generatedEmail) {
      setEditedSubject(generatedEmail.subject)
      setEditedBody(generatedEmail.body)
    }
  }, [generatedEmail])

  const handleSendEmail = () => {
    onSendEmail({
      subject: editedSubject,
      body: editedBody
    })
  }

  return (
    <div>
      <h2 className="text-xl mb-4">✍️ Email Composition</h2>
      
      {isGeneratingEmail && (
        <div className="border border-yellow-400 p-4 mb-4">
          <div className="text-sm text-yellow-500 mb-2">
            AI Assistant ({selectedCharacter?.toUpperCase()}) is crafting your email...
          </div>
          <div className="text-xs text-yellow-600">Please wait while we generate your email...</div>
        </div>
      )}

      {generatedEmail && (
        <div className="border border-green-400 p-4 mb-4">
          <div className="text-sm text-green-500 mb-4">
            ✏️ Edit your email before sending:
          </div>
          
          {/* Subject Field */}
          <div className="mb-4">
            <label className="block text-sm text-green-400 mb-2">Subject:</label>
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              className="w-full border-2 border-green-400 bg-black text-green-400 p-2 font-bold"
              placeholder="Enter email subject..."
            />
          </div>

          {/* Body Field */}
          <div className="mb-4">
            <label className="block text-sm text-green-400 mb-2">Email Body:</label>
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              className="w-full border-2 border-green-400 bg-black text-green-400 p-3 leading-relaxed whitespace-pre-wrap resize-none"
              rows={12}
              placeholder="Enter email body..."
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-green-500">
              Character: {selectedCharacter?.toUpperCase()}
            </div>
            <Button onClick={handleSendEmail} className="bg-green-600 hover:bg-green-700 text-black">
              Send Email →
            </Button>
          </div>
        </div>
      )}

      {!generatedEmail && !isGeneratingEmail && (
        <div className="text-center text-yellow-400">
          No email content available. Please try again.
        </div>
      )}
    </div>
  )
} 