import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">thatblog</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input id="email" type="email" placeholder="your@email.com" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input id="password" type="password" required />
            </div>

            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </form>
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
