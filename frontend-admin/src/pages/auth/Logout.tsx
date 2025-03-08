export default function LoginPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-mono font-bold text-gray-900">thatblog</h2>
          <p className="mt-2 text-sm text-gray-600">You are now signed-out</p>
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600 mb-2">Want to learn more about our project?</p>
          <div className="flex justify-center space-x-4">
            <a href="/about" className="text-blue-600 hover:text-blue-800 font-medium">
              About
            </a>
            <a href="/features" className="text-blue-600 hover:text-blue-800 font-medium">
              Features
            </a>
            <a href="/docs" className="text-blue-600 hover:text-blue-800 font-medium">
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
