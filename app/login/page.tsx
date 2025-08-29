import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login to SoleSense</h2>
      <LoginForm />
    </div>
  )
}
