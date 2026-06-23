import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '스스로톡 멘토 대시보드',
  description: '학생 질문에 답변하고 매칭을 관리하는 멘토 전용 화면',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', backgroundColor: '#FFF8E7' }}>
        {children}
      </body>
    </html>
  )
}
