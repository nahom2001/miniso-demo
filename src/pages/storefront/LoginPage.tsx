import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, DEMO_ACCOUNTS } from '@/stores/authStore'
import { brand } from '@/config/brand.config'
import { useToast } from '@/components/ui/toast'

export function LoginPage() {
  const { t } = useTranslation()
  const { login, loginAs } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  // identifier = phone number or email (phone is primary per proposal)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const ok = await login(identifier, password)
    setLoading(false)
    if (ok) {
      toast({ title: 'Welcome back!', variant: 'success' })
      navigate('/')
    } else {
      toast({
        title: 'Invalid credentials',
        description: 'Use phone number or email with password: demo123',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/50 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-700/50 rounded-full translate-y-40 -translate-x-40" />
        <div className="relative text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black mb-6 mx-auto">M</div>
          <h1 className="text-4xl font-bold mb-3">{brand.name}</h1>
          <p className="text-xl text-white/80">{brand.tagline}</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">M</div>
            <span className="font-bold text-lg">{brand.shortName}</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-6 text-sm">Sign in with your phone number or email</p>

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <Label htmlFor="identifier">Phone Number or Email</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1"
                placeholder="+251 9XX XXX XXX or email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white"
              loading={loading}
            >
              {t('nav.login')}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mb-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:underline font-medium">Register</Link>
          </p>

          {/* Demo accounts */}
          <div className="border rounded-xl p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold">Demo Accounts</h3>
              <Badge variant="tbc" className="text-xs">password: demo123</Badge>
            </div>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    loginAs(acc.id)
                    toast({ title: `Logged in as ${acc.role}`, variant: 'success' })
                    navigate('/')
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-left group"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
                    {acc.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{acc.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {acc.phone ?? acc.email}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">{acc.role}</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
