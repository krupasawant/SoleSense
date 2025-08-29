import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create an Account</h2>
      <SignupForm />
    </div>
  )
}
