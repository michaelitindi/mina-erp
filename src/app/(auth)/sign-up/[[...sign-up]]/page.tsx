import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-zinc-400">Get started with MinaERP</p>
      </div>
      <div className="flex justify-center">
        <SignUp 
          appearance={{
            elements: {
              card: 'bg-zinc-900 border-zinc-800 shadow-xl',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 transition-colors',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
            }
          }}
        />
      </div>
    </div>
  )
}
