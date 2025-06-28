"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useChainId, useSwitchChain } from "wagmi"
import { sepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AboutPage from "./about-page"
import CRTContainer from "./components/CRTContainer"
import NavBar from "./components/NavBar"
import { GameState, Character, Email } from "@/types/game"
import { emails, characterResponses } from "@/data/gameData"
import { 
  useSADCoinBalance, 
  useFEELSBalance, 
  formatSADBalance, 
  formatFEELSBalance 
} from "@/hooks/useContracts"
import { useReadContract } from "wagmi"
import { SEPOLIA_CONTRACTS } from "@/lib/contracts"
import { generateEmail, EmailGenerationResponse, EmailContent } from "@/lib/gemini"

// Import screen components
import {
  BootScreen,
  LoginScreen,
  LoadingAScreen,
  LoadingBScreen,
  LoadingCScreen,
  EmailInputScreen,
  EmailInputContainer,
  InboxScreen,
  LoadingContainer,
  ReadingScreen,
  CharacterSelectScreen,
  MiniGameScreen,
  WritingScreen,
  SentScreen,
  AgentResponsesScreen,
  EmailViewScreen
} from "./components/screens"

export default function Component() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [gameState, setGameState] = useState<GameState>("boot")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [gameProgress, setGameProgress] = useState(0)
  const [generatedEmails, setGeneratedEmails] = useState<EmailGenerationResponse | null>(null)
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [userSadInput, setUserSadInput] = useState("")
  const [selectedEmailContent, setSelectedEmailContent] = useState<EmailContent | null>(null)
  const [selectedEmailSender, setSelectedEmailSender] = useState<string>("")

  // Web3 token balances
  const { data: sadBalance, error: sadError, isLoading: sadLoading } = useSADCoinBalance(address)
  const { data: feelsBalance, error: feelsError, isLoading: feelsLoading } = useFEELSBalance(address)

  // Direct contract test
  const { data: directSadBalance, error: directSadError, isLoading: directSadLoading } = useReadContract({
    address: SEPOLIA_CONTRACTS.SADCoin,
    abi: [
      {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000
    }
  })

  // Format balances for display
  const sadCoins = formatSADBalance(typeof sadBalance === 'bigint' ? sadBalance : BigInt(0))
  const feels = formatFEELSBalance(typeof feelsBalance === 'bigint' ? feelsBalance : BigInt(0))

  // Debug logging
  console.log("Wallet Debug:", {
    address,
    isConnected,
    chainId,
    isOnSepolia: chainId === 11155111,
    sadBalance: typeof sadBalance === 'bigint' ? sadBalance.toString() : sadBalance,
    feelsBalance: typeof feelsBalance === 'bigint' ? feelsBalance.toString() : feelsBalance,
    directSadBalance: typeof directSadBalance === 'bigint' ? directSadBalance.toString() : directSadBalance,
    sadError: sadError?.message,
    feelsError: feelsError?.message,
    directSadError: directSadError?.message,
    sadLoading,
    feelsLoading,
    directSadLoading,
    formattedSad: sadCoins,
    formattedFeels: feels,
    contractAddresses: {
      SADCoin: "0xace84066b7e68f636dac3c3438975de22cf4af20",
      FEELS: "0xe5180fa5acaf05717d49bf2ec4f6fd0261db92b2"
    }
  })

  // Test network connectivity
  useEffect(() => {
    if (isConnected && chainId === 11155111) {
      console.log("Testing Sepolia connectivity...")
      fetch('https://sepolia.drpc.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Sepolia RPC response:", data)
      })
      .catch(error => {
        console.error("Sepolia RPC error:", error)
      })

      // Test contract addresses
      console.log("Testing contract addresses...")
      const testContract = (address: string, name: string) => {
        fetch('https://sepolia.drpc.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [address, 'latest'],
            id: 1
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log(`${name} contract test:`, {
            address,
            hasCode: data.result !== '0x' && data.result !== '0x0',
            codeLength: data.result ? data.result.length : 0
          })
        })
        .catch(error => {
          console.error(`${name} contract test error:`, error)
        })
      }

      testContract(SEPOLIA_CONTRACTS.SADCoin, 'SADCoin')
      testContract(SEPOLIA_CONTRACTS.FEELS, 'FEELS')
      testContract(SEPOLIA_CONTRACTS.ConversionContract, 'ConversionContract')

      // Test user's balance directly
      if (address) {
        console.log("Testing user balance...")
        fetch('https://sepolia.drpc.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: SEPOLIA_CONTRACTS.SADCoin,
              data: '0x70a08231' + '000000000000000000000000' + address.slice(2)
            }, 'latest'],
            id: 1
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log("User SAD balance test:", {
            address,
            result: data.result,
            hasBalance: data.result !== '0x0000000000000000000000000000000000000000000000000000000000000000'
          })
        })
        .catch(error => {
          console.error("User balance test error:", error)
        })
      }
    }
  }, [isConnected, chainId])

  // Event handlers
  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    setGameState("reading")
  }

  const handleCharacterInteraction = () => {
    setGameState("character-select")
  }

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character)
    setGameState("loading-a")
  }

  const handleContinueClick = () => {
    setGameState("loading-b")
  }

  const handleMonitorClick = () => {
    setGameState("loading-c")
  }

  const handleEmailSubmit = async (userInput: string) => {
    console.log("Email submitted:", userInput)
    
    setUserSadInput(userInput)
    setIsGeneratingEmail(true)
    
    try {
      const emailResponse = await generateEmail({
        userInput
      })

      if (emailResponse.success) {
        setGeneratedEmails(emailResponse)
        setGameState("agent-responses")
      } else {
        console.error("Failed to generate emails:", emailResponse.error)
        // Fallback to agent responses with error messages
        setGeneratedEmails({
          agentInitialEmail: { subject: "Error", body: "Failed to generate agent email" },
          officerInitialEmail: { subject: "Error", body: "Failed to generate officer email" },
          monkeyInitialEmail: { subject: "Error", body: "Failed to generate monkey email" },
          success: false,
          error: emailResponse.error
        })
        setGameState("agent-responses")
      }
    } catch (error) {
      console.error("Error in email generation:", error)
      setGeneratedEmails({
        agentInitialEmail: { subject: "Error", body: "Failed to generate agent email" },
        officerInitialEmail: { subject: "Error", body: "Failed to generate officer email" },
        monkeyInitialEmail: { subject: "Error", body: "Failed to generate monkey email" },
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      })
      setGameState("agent-responses")
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const handleEmailSelect = (email: EmailContent, sender: string) => {
    setSelectedEmailContent(email)
    setSelectedEmailSender(sender)
    setGameState("email-view")
  }

  const handleEmailViewBack = () => {
    setGameState("agent-responses")
  }

  const handleEmailViewContinue = () => {
    setGameState("writing")
  }

  const playMiniGame = () => {
    setGameState("mini-game")
  }

  const sendEmail = (editedEmail: EmailContent) => {
    // Store the final edited email content
    setSelectedEmailContent(editedEmail)
    setGameState("sent")
  }

  const resetGame = () => {
    setGameState("login")
    setSelectedEmail(null)
    setSelectedCharacter(null)
    setGameProgress(0)
    setGeneratedEmails(null)
    setIsGeneratingEmail(false)
    setUserSadInput("")
    setSelectedEmailContent(null)
    setSelectedEmailSender("")
  }

  // Render the appropriate screen based on game state
  const renderScreen = () => {
    switch (gameState) {
      case "boot":
        return (
          <BootScreen
            onDone={() => setGameState("login")}
            skip={() => setGameState("login")}
          />
        )

      case "login":
        return (
          <LoginScreen
            onSelectCharacter={handleCharacterSelect}
          />
        )

      case "loading-a":
        return (
          <LoadingAScreen
            onContinue={handleContinueClick}
          />
        )

      case "loading-b":
        return (
          <LoadingBScreen
            onMonitorClick={handleMonitorClick}
          />
        )

      case "loading-c":
        return (
          <LoadingCScreen
            onComplete={() => setGameState("email-input")}
          />
        )

      case "email-input":
        return (
          <EmailInputScreen
            onSubmit={handleEmailSubmit}
          />
        )

      case "inbox":
        return (
          <InboxScreen
            emails={emails}
            onEmailClick={handleEmailClick}
          />
        )

      case "reading":
        return selectedEmail && selectedCharacter ? (
          <ReadingScreen
            selectedEmail={selectedEmail}
            selectedCharacter={selectedCharacter}
            onBackToInbox={() => setGameState("inbox")}
            onCharacterInteraction={handleCharacterInteraction}
          />
        ) : null

      case "character-select":
        return selectedCharacter ? (
          <CharacterSelectScreen
            selectedCharacter={selectedCharacter}
            onPlayMiniGame={playMiniGame}
          />
        ) : null

      case "mini-game":
        return selectedCharacter ? (
          <MiniGameScreen
            selectedCharacter={selectedCharacter}
          />
        ) : null

      case "writing":
        return selectedEmailContent ? (
          <WritingScreen
            selectedCharacter={selectedCharacter}
            generatedEmail={selectedEmailContent}
            isGeneratingEmail={false}
            onSendEmail={sendEmail}
          />
        ) : null

      case "sent":
        return (
          <SentScreen
            onResetGame={resetGame}
            sentEmail={selectedEmailContent || undefined}
          />
        )

      case "about":
        return <AboutPage onBack={() => setGameState("inbox")} />

      case "agent-responses":
        return generatedEmails ? (
          <AgentResponsesScreen
            userSadInput={userSadInput}
            agentInitialEmail={generatedEmails.agentInitialEmail}
            officerInitialEmail={generatedEmails.officerInitialEmail}
            monkeyInitialEmail={generatedEmails.monkeyInitialEmail}
            onSelectEmail={handleEmailSelect}
          />
        ) : null

      case "email-view":
        return selectedEmailContent ? (
          <EmailViewScreen
            email={selectedEmailContent}
            sender={selectedEmailSender}
            onBack={handleEmailViewBack}
            onContinue={handleEmailViewContinue}
          />
        ) : null

      default:
        return null
    }
  }

  return (
    <>
      <NavBar 
        gameState={gameState}
        debugInfo={{
          chainId,
          address,
          isConnected,
          isOnSepolia: chainId === 11155111,
          sadBalance: sadBalance?.toString(),
          directSadBalance: directSadBalance?.toString(),
          sadLoading,
          directSadLoading,
          sadError,
          directSadError,
          feelsBalance: feelsBalance?.toString(),
          feelsLoading
        }}
      />
      <CRTContainer>
        <Card className="border-2 border-green-400 bg-black text-green-400 w-full h-full flex flex-col">
          {/* Header */}
          <div className="border-b-2 border-green-400 p-2 bg-black">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-center flex-1">══ SADCOIN ══</h1>
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="border-yellow-400 text-yellow-400 mr-2">
                  SAD: {sadCoins}
                </Badge>
                <Badge variant="outline" className="border-pink-400 text-pink-400 mr-2">
                  FEELS: {feels}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGameState("about")}
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20 mr-2"
                >
                  ABOUT
                </Button>
              </div>
            </div>
          </div>

          {/* Main Terminal */}
          <div className="flex-1 overflow-auto p-6">
            {renderScreen()}
          </div>

          {/* Footer */}
          <div className="text-center text-green-600 text-sm border-t-2 border-green-400 p-2">
            <p>A productivity tool disguised as a procrastination game</p>
            <p className="text-xs mt-1">Built for the intersection of game theory and behavioral economics</p>
          </div>
        </Card>
      </CRTContainer>

      {/* Loading containers and email input container */}
      <LoadingContainer gameState={gameState} />
      
      {gameState === "email-input" && (
        <EmailInputContainer onSubmit={handleEmailSubmit} />
      )}
    </>
  )
}