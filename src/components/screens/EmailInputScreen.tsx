import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface EmailInputScreenProps {
  onSubmit: (userInput: string) => void
}

export function EmailInputScreen({ onSubmit }: EmailInputScreenProps) {
  return (
    <div className="space-y-6">
      {/* Monitor Content - Email Input Interface */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">SADTEXT BOX</h2>
        <p className="text-sm text-green-300 mb-4">
          Paste your sad content or sad idea<br />
          that needs to be in an email BELOW. 447447447
        </p>
      </div>
    </div>
  )
}

// Container component for the footer area
export function EmailInputContainer({ onSubmit }: EmailInputScreenProps) {
  const [userSadInput, setUserSadInput] = useState('')

  const handleSubmit = () => {
    onSubmit(userSadInput)
  }

  return (
    <div className="w-full bg-black border-2 border-green-400 p-6 mb-8">
      <div className="flex justify-center items-start gap-4">
        {/* Main rectangular input box */}
        <div className="w-[60vw] max-w-md h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm">SADTEXT BOX</span>
          </div>
        </div>
      </div>

      {/* Email input interface */}
      <div className="flex justify-center items-start gap-4 mt-4">
        {/* Intern image placeholder */}
        <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          46800d4bc
        </div>
        
        {/* Textarea for user input */}
        <div className="w-[60vw] max-w-md">
          <textarea
            value={userSadInput}
            onChange={(e) => setUserSadInput(e.target.value)}
            placeholder="Paste your sad content or sad idea that needs to be in an email..."
            maxLength={256}
            className="w-full h-32 border-2 border-green-400 bg-black text-green-400 p-3 resize-none font-mono text-sm"
          />
          <div className="text-xs text-green-500 mt-1 text-right">
            {userSadInput.length}/256
          </div>
        </div>
        
        {/* Submit button */}
        <div className="w-24 h-8 border-2 border-green-400 bg-black rounded-lg flex items-center justify-center">
          <Button 
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-black text-xs px-2 py-1"
          >
            WRITE THE E-MAIL
          </Button>
        </div>
      </div>
    </div>
  )
} 