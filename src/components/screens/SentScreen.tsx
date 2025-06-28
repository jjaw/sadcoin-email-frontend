import { Button } from '@/components/ui/button'
import { EmailContent } from '@/lib/gemini'

interface SentScreenProps {
  onResetGame: () => void
  sentEmail?: EmailContent
}

export function SentScreen({ onResetGame, sentEmail }: SentScreenProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-green-400">🎉 SUCCESS!</h2>
      <div className="border border-green-400 p-6 mb-4">
        <div className="text-lg mb-4">Email sent successfully!</div>
        
        {sentEmail && (
          <div className="border border-blue-400 p-4 mb-4 text-left">
            <div className="text-sm text-blue-500 mb-2">Final Email Sent:</div>
            <div className="text-lg mb-2 font-bold text-blue-300">{sentEmail.subject}</div>
            <div className="text-blue-300 leading-relaxed whitespace-pre-wrap text-sm">{sentEmail.body}</div>
          </div>
        )}
        
        <div className="text-green-300 mb-4">
          You just completed a real task while thinking you were procrastinating!
        </div>
        <div className="text-yellow-400 text-sm mb-4">
          <strong>THE META-GAME REVEALED:</strong> This entire experience was a commitment device that used
          gamification to overcome procrastination. You "wasted time" but actually got work done!
        </div>
        <div className="text-pink-400">+20 FEELS earned for productivity through procrastination!</div>
      </div>
      <Button onClick={onResetGame} className="bg-purple-600 hover:bg-purple-700 text-white">
        Write Another Email? 🔄
      </Button>
    </div>
  )
} 