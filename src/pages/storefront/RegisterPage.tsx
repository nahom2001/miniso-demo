import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Phone, CreditCard, CheckCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { brand } from '@/config/brand.config'
import { useToast } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

type Step = 'details' | 'otp' | 'fayda' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'details', label: 'Your Info' },
  { id: 'otp',     label: 'Verify Phone' },
  { id: 'fayda',   label: 'Fayda ID' },
]

const BENEFITS = [
  'Free delivery on orders over Br 1,500',
  'Exclusive member discounts & coupons',
  'Easy returns within 14 days',
  'Real-time order tracking',
  'Pay with Telebirr, CBE Birr & more',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', ''])
  const [faydaStatus, setFaydaStatus] = useState<'idle' | 'verifying' | 'verified'>('idle')

  const [form, setForm] = useState({ name: '', phone: '', faydaId: '', password: '' })
  function setField(key: string, value: string) { setForm((p) => ({ ...p, [key]: value })) }

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  // ── Step 1: submit details → send OTP ─────────────────────────────────────
  async function handleDetails(e: React.FormEvent) {
    e.preventDefault()
    if (!form.phone.match(/^\+?251[0-9]{9}$|^0[0-9]{9}$/)) {
      toast({ title: 'Invalid phone number', description: 'Enter a valid Ethiopian number (+251…)', variant: 'destructive' })
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    toast({ title: 'OTP sent!', description: `A 4-digit code was sent to ${form.phone}`, variant: 'default' })
    setStep('otp')
  }

  // ── Step 2: verify OTP ─────────────────────────────────────────────────────
  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length < 4) { toast({ title: 'Enter the 4-digit code', variant: 'destructive' }); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    // Demo: any 4-digit code passes
    toast({ title: 'Phone verified ✓', variant: 'success' })
    setStep('fayda')
  }

  function handleOtpInput(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return
    const next = [...otpDigits]
    next[idx] = val
    setOtpDigits(next)
    if (val && idx < 3) {
      const nextInput = document.getElementById(`otp-${idx + 1}`)
      nextInput?.focus()
    }
  }

  // ── Step 3: Fayda ID verification ─────────────────────────────────────────
  async function handleFayda(e: React.FormEvent) {
    e.preventDefault()
    if (!form.faydaId.trim()) { toast({ title: 'Fayda ID required', variant: 'destructive' }); return }
    setFaydaStatus('verifying')
    await new Promise((r) => setTimeout(r, 1200))
    setFaydaStatus('verified')
    await new Promise((r) => setTimeout(r, 600))

    // Complete registration
    await login('customer@demo', 'demo123')
    setStep('done')
    await new Promise((r) => setTimeout(r, 1400))
    toast({ title: `Welcome, ${form.name || 'to Miniso'}! 🎉`, variant: 'success' })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-brand-700 to-brand-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36" />
        <div className="relative text-white text-center w-full max-w-xs">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black mb-6 mx-auto">M</div>
          <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
          <p className="text-white/70 mb-10 text-sm">{brand.tagline}</p>
          <div className="space-y-3 text-left">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3 text-white/90 text-sm">
                <CheckCircle className="h-4 w-4 text-white/60 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-gray-50">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">M</div>
            <span className="font-bold text-lg">{brand.shortName}</span>
          </div>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="flex items-center gap-0 mb-8">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                      i < stepIndex ? 'bg-green-500 border-green-500 text-white'
                        : i === stepIndex ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    )}>
                      {i < stepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn(
                      'text-[10px] font-medium whitespace-nowrap',
                      i === stepIndex ? 'text-brand-600' : 'text-gray-400'
                    )}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mb-4 mx-1',
                      i < stepIndex ? 'bg-green-500' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Step 1: details ─────────────────────────────────── */}
          {step === 'details' && (
            <>
              <h2 className="text-2xl font-bold mb-1">Create account</h2>
              <p className="text-muted-foreground text-sm mb-6">Quick registration — we'll verify your phone next</p>
              <form onSubmit={handleDetails} className="space-y-4">
                <div>
                  <Label htmlFor="reg-name">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="reg-name" className="mt-1" value={form.name} onChange={(e) => setField('name', e.target.value)}
                    placeholder="Abebe Kebede" required />
                </div>
                <div>
                  <Label htmlFor="reg-phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input id="reg-phone" type="tel" className="mt-1" value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)} placeholder="+251 9XX XXX XXX" required />
                  <p className="text-xs text-muted-foreground mt-1">We'll send a verification code to this number</p>
                </div>
                <div>
                  <Label htmlFor="reg-password">Password <span className="text-destructive">*</span></Label>
                  <div className="relative mt-1">
                    <Input id="reg-password" type={showPw ? 'text' : 'password'} value={form.password}
                      onChange={(e) => setField('password', e.target.value)} className="pr-10"
                      placeholder="Min. 8 characters" required minLength={8} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  By registering you agree to our <a href="#" className="underline">Terms</a> &{' '}
                  <a href="#" className="underline">Privacy Policy</a>
                </p>
                <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white" loading={loading}>
                  Send Verification Code <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
              <p className="text-sm text-center text-muted-foreground mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
              </p>
            </>
          )}

          {/* ── Step 2: OTP ─────────────────────────────────────── */}
          {step === 'otp' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-5 w-5 text-brand-600" />
                <h2 className="text-2xl font-bold">Verify your phone</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Enter the 4-digit code sent to <span className="font-medium text-foreground">{form.phone}</span>
              </p>
              <form onSubmit={handleOtp} className="space-y-6">
                <div className="flex gap-3 justify-center">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus()
                        }
                      }}
                      className={cn(
                        'w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all',
                        d ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-300 focus:border-brand-400'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Didn't receive a code?{' '}
                  <button type="button" className="text-brand-600 underline" onClick={() => toast({ title: 'Code resent', variant: 'default' })}>
                    Resend OTP
                  </button>
                </p>
                <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white" loading={loading}>
                  Verify & Continue <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <button type="button" onClick={() => setStep('details')}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
                  ← Change phone number
                </button>
              </form>
            </>
          )}

          {/* ── Step 3: Fayda ID ─────────────────────────────────── */}
          {step === 'fayda' && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                <h2 className="text-2xl font-bold">Fayda ID Verification</h2>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Enter your Fayda National ID for instant identity confirmation
              </p>
              <form onSubmit={handleFayda} className="space-y-4">
                <div>
                  <Label htmlFor="reg-fayda" className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Fayda National ID <span className="text-destructive">*</span>
                  </Label>
                  <Input id="reg-fayda" className="mt-1 font-mono tracking-wider" value={form.faydaId}
                    onChange={(e) => setField('faydaId', e.target.value)}
                    placeholder="FAYDA-XXXX-XXXXXX" required disabled={faydaStatus !== 'idle'} />

                  {/* Verification status indicator */}
                  {faydaStatus === 'verifying' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying with Fayda database…
                    </div>
                  )}
                  {faydaStatus === 'verified' && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Identity verified successfully
                    </div>
                  )}
                  {faydaStatus === 'idle' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your identity is verified securely — no data is stored beyond your account
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                  loading={faydaStatus === 'verifying'} disabled={faydaStatus !== 'idle'}>
                  Verify &amp; Activate Account
                </Button>
              </form>
            </>
          )}

          {/* ── Done ─────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Account Activated!</h2>
              <p className="text-muted-foreground text-sm mb-2">Welcome to Miniso Ethiopia, {form.name}.</p>
              <p className="text-xs text-muted-foreground">Redirecting you to the store…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
