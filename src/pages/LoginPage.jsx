import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'ms_staff', label: 'MS Staff' },
  { value: 'ms_manager', label: 'MS Manager' },
  { value: 'agency', label: 'Agency (협력업체)' },
]

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('user')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp) {
      const metadata = { name, role }
      if (role === 'agency' && company) metadata.company = company
      const { error } = await signUp(email, password, name, role, company)
      if (error) setError(error.message)
      else setError('가입 완료! 이메일을 확인해주세요.')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F1F1] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-8 bg-[#FDB813] rounded-sm" />
            <span className="text-lg font-bold text-[#13294B]">MKT Process</span>
          </div>
          <CardTitle className="text-2xl text-[#13294B]">Marketing Process Management</CardTitle>
          <CardDescription>
            {isSignUp ? '새 계정을 만드세요' : 'Sign in to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="홍길동"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {role === 'agency' && (
                  <div className="space-y-2">
                    <Label htmlFor="company">회사명</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="협력업체 회사명"
                      required
                    />
                  </div>
                )}
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className={`text-sm px-3 py-2 rounded-md ${
                error.includes('완료')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-[#13294B] hover:bg-[#13294B]/90" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignUp ? '이미 계정이 있으신가요? Sign In' : '계정이 없으신가요? Sign Up'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
