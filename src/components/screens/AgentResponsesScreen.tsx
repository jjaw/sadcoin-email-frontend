import { Button } from '@/components/ui/button'
import { EmailContent } from '@/lib/gemini'

interface AgentResponsesScreenProps {
  userSadInput: string
  agentInitialEmail: EmailContent
  officerInitialEmail: EmailContent
  monkeyInitialEmail: EmailContent
  onSelectEmail: (email: EmailContent, sender: string) => void
}

export function AgentResponsesScreen({ 
  userSadInput, 
  agentInitialEmail, 
  officerInitialEmail, 
  monkeyInitialEmail, 
  onSelectEmail 
}: AgentResponsesScreenProps) {
  return (
    <div>
      <h2 className="text-xl mb-4">📧 Check Messages From:</h2>
      
      <div className="space-y-4">
        {/* Officer Option */}
        <div 
          onClick={() => onSelectEmail(officerInitialEmail, "Officer")}
          className="border border-green-400 p-4 cursor-pointer hover:bg-green-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
              👔
            </div>
            <div>
              <div className="font-bold text-green-300">1) Officer</div>
              <div className="text-sm text-green-500">Want you on this. LET'S START WITH THE BASICS</div>
            </div>
          </div>
        </div>

        {/* Agent Option */}
        <div 
          onClick={() => onSelectEmail(agentInitialEmail, "Agent")}
          className="border border-green-400 p-4 cursor-pointer hover:bg-green-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
              🕵️
            </div>
            <div>
              <div className="font-bold text-green-300">2) Agent</div>
              <div className="text-sm text-green-500">I took a look at the Key Action Items you should...</div>
            </div>
          </div>
        </div>

        {/* Monkey Option */}
        <div 
          onClick={() => onSelectEmail(monkeyInitialEmail, "Monkey")}
          className="border border-green-400 p-4 cursor-pointer hover:bg-green-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
              🐒
            </div>
            <div>
              <div className="font-bold text-green-300">3) Monkey</div>
              <div className="text-sm text-green-500">You shouldn't anyone worry about the small details...</div>
            </div>
          </div>
        </div>

        {/* Self Option */}
        <div 
          onClick={() => onSelectEmail({ subject: "Your Email", body: userSadInput }, "Self")}
          className="border border-green-400 p-4 cursor-pointer hover:bg-green-900/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
              👤
            </div>
            <div>
              <div className="font-bold text-green-300">4) Self</div>
              <div className="text-sm text-green-500">Your original sad content</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 border border-yellow-400 text-yellow-400 text-sm">
        <strong>GAME THEORY INSIGHT:</strong> Each email choice represents a different communication strategy and personality archetype!
      </div>
    </div>
  )
} 