export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Rishi Platform
        </h1>
        <p className="text-xl text-center mb-8 text-gray-600">
          Enterprise Workforce Management Platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Azure Functions</h3>
            <p className="text-gray-600">143 API routes converted to serverless functions</p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Event Grid</h3>
            <p className="text-gray-600">EventBus system for enterprise event processing</p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Global CDN</h3>
            <p className="text-gray-600">Static frontend distributed worldwide</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Cannabis workforce management across multiple states
          </p>
        </div>
      </div>
    </main>
  )
}