import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Phone, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { brand } from '@/config/brand.config'
import { useToast } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/authStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    faydaId: '',
    password: '',
  })

  function setField(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!form.phone.match(/^\+?251[0-9]{9}$|^0[0-9]{9}$/)) {
      toast({ title: 'Invalid phone number', description: 'Enter a valid Ethiopian phone number (+251…)', variant: 'destructive' })
      return
    }
    if (!form.faydaId.trim()) {
      toast({ title: 'Fayda ID required', description: 'Please enter your Fayda national ID', variant: 'destructive' })
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    // Demo: auto-login as the customer demo account after "registration"
    await login('customer@demo', 'demo123')
    setLoading(false)
    toast({ title: 'Account created! Welcome to Miniso 🎉', description: `Registered as ${form.name}`, variant: 'success' })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-700 to-brand-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />
        <div className="relative text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black mb-6 mx-auto">M</div>
          <h1 className="text-4xl font-bold mb-3">{brand.name}</h1>
          <p className="text-xl text-white/80 mb-8">{brand.tagline}</p>
          <div className="space-y-3 text-left">
            {[
              'Free delivery on orders over Br 1,500',
              'Exclusive member discounts & coupons',
              'Easy returns within 14 days',
              'Real-time order tracking',
              'Pay with Telebirr, CBE Birr & more',
            ].map((b) => (
              <div key={b} className="flex items-center gap-2 text-white/90 text-sm">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs flex-shrink-0">✓</div>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">M</div>
            <span className="font-bold text-lg">{brand.shortName}</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="h-5 w-5 text-brand-600" />
            <h2 className="text-2xl font-bold">Create account</h2>
          </div>
          <p className="text-muted-foreground mb-6 text-sm">Join Miniso Ethiopia today</p>

          <form onSubmit={handleRegister} className="space-y-4 mb-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="reg-name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="reg-name"
                className="mt-1"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Abebe Kebede"
                required
              />
            </div>

            {/* Phone number — primary identifier per proposal */}
            <div>
              <Label htmlFor="reg-phone" className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-phone"
                className="mt-1"
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+251 9XX XXX XXX"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Used as your unique account identifier</p>
            </div>

            {/* Fayda ID — national ID per proposal */}
            <div>
              <Label htmlFor="reg-fayda" className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" />
                Fayda ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-fayda"
                className="mt-1"
                value={form.faydaId}
                onChange={(e) => setField('faydaId', e.target.value)}
                placeholder="FAYDA-XXXX-XXXXXX"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Your Ethiopian national identification number</p>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="reg-password">Password <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <Input
                  id="reg-password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  className="pr-10"
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
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

            <p className="text-xs text-muted-foreground">
              By registering you agree to our{' '}
              <a href="#" className="underline">Terms of Service</a> &{' '}
              <a href="#" className="underline">Privacy Policy</a>
            </p>

            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
