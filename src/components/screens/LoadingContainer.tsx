interface LoadingContainerProps {
  gameState: string
  onSubmit?: (userInput: string) => void
}

export function LoadingContainer({ gameState, onSubmit }: LoadingContainerProps) {
  if (!(gameState === "loading-a" || gameState === "loading-b" || gameState === "loading-c")) {
    return null
  }

  return (
    <div className="w-full bg-black border-2 border-green-400 p-6 mb-8">
      <div className="flex justify-center items-start gap-4">
        {/* Main rectangular input box */}
        <div className="w-[60vw] max-w-md h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          Loading...
        </div>
      </div>
    </div>
  )
} 