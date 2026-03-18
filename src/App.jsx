import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('연결 확인 중...')

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('_dummy_check').select('*').limit(1)
        // 테이블이 없어도 연결 자체는 성공 (42P01 = relation does not exist)
        if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
          setStatus(`연결 오류: ${error.message}`)
        } else {
          setStatus('Supabase 연결 성공!')
        }
      } catch (err) {
        setStatus(`연결 실패: ${err.message}`)
      }
    }
    checkConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          마케팅 프로세스 관리 시스템
        </h1>
        <div className={`text-lg font-medium ${
          status.includes('성공') ? 'text-green-600' :
          status.includes('오류') || status.includes('실패') ? 'text-red-600' :
          'text-yellow-600'
        }`}>
          {status}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Supabase URL: {import.meta.env.VITE_SUPABASE_URL}
        </p>
      </div>
    </div>
  )
}

export default App
