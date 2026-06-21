import { render, screen } from '@testing-library/react'
import NewsCard from './NewsCard'
import { NewsItem } from '@/types'

vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const VALID_NEWS: NewsItem = {
  id: 'news-001',
  headline: 'เฟดส่งสัญญาณลดดอกเบี้ย',
  summary: 'ธนาคารกลางสหรัฐฯ แสดงสัญญาณลดดอกเบี้ย 2 ครั้งในปีนี้',
  source_url: 'https://bloomberg.com/test-article',
  content: 'Full article content for testing.',
  category: 'ดอกเบี้ยโลก',
  published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  source: 'Bloomberg',
  ai_analysis: {
    summary: 'สัญญาณบวกที่ชัดเจน',
    affected_sectors: ['อสังหาฯ'],
    affected_stocks: ['SPALI'],
    sentiment: 'bullish',
    analysis_at: new Date().toISOString(),
  },
  stock_impacts: [
    { symbol: 'SPALI', direction: 'positive', reason: null },
    { symbol: 'KBANK', direction: 'neutral', reason: null },
    { symbol: 'AAV', direction: 'negative', reason: null },
  ],
  featured: false,
}

describe('NewsCard', () => {
  it('renders the headline', () => {
    render(<NewsCard news={VALID_NEWS} />)
    expect(screen.getByText('เฟดส่งสัญญาณลดดอกเบี้ย')).toBeInTheDocument()
  })

  it('renders the source name', () => {
    render(<NewsCard news={VALID_NEWS} />)
    expect(screen.getByText('Bloomberg')).toBeInTheDocument()
  })

  it('renders category label — maps Thai category to English code', () => {
    render(<NewsCard news={VALID_NEWS} />)
    expect(screen.getByText('RATES')).toBeInTheDocument()
  })

  it('renders ai_analysis summary text via AIInsightBox', () => {
    render(<NewsCard news={VALID_NEWS} />)
    expect(screen.getByText('สัญญาณบวกที่ชัดเจน')).toBeInTheDocument()
  })

  it('AIInsightBox shows pending state when ai_analysis is null', () => {
    render(<NewsCard news={{ ...VALID_NEWS, ai_analysis: null }} />)
    expect(screen.getByText('Analysis in progress')).toBeInTheDocument()
  })

  it('SentimentBadge is hidden when ai_analysis is null', () => {
    render(<NewsCard news={{ ...VALID_NEWS, ai_analysis: null }} />)
    expect(screen.queryByLabelText(/Market sentiment/i)).not.toBeInTheDocument()
  })

  it('stock badges are hidden when ai_analysis is null', () => {
    const { container } = render(<NewsCard news={{ ...VALID_NEWS, ai_analysis: null }} />)
    expect(container.querySelector('[aria-label="SPALI: rising"]')).toBeNull()
  })

  it('positive stock impact badge has ▲ arrow and aria-label', () => {
    const { container } = render(<NewsCard news={{ ...VALID_NEWS, stock_impacts: [{ symbol: 'SPALI', direction: 'positive', reason: null }] }} />)
    const badge = container.querySelector('[aria-label="SPALI: rising"]') as HTMLElement
    expect(badge).toBeTruthy()
    expect(badge).toHaveTextContent('▲')
    expect(badge).toHaveTextContent('SPALI')
  })

  it('neutral stock impact badge has – dash and aria-label', () => {
    const { container } = render(<NewsCard news={{ ...VALID_NEWS, stock_impacts: [{ symbol: 'KBANK', direction: 'neutral', reason: null }] }} />)
    const badge = container.querySelector('[aria-label="KBANK: unchanged"]') as HTMLElement
    expect(badge).toBeTruthy()
    expect(badge).toHaveTextContent('–')
    expect(badge).toHaveTextContent('KBANK')
  })

  it('negative stock impact badge has ▼ arrow and aria-label', () => {
    const { container } = render(<NewsCard news={{ ...VALID_NEWS, stock_impacts: [{ symbol: 'AAV', direction: 'negative', reason: null }] }} />)
    const badge = container.querySelector('[aria-label="AAV: falling"]') as HTMLElement
    expect(badge).toBeTruthy()
    expect(badge).toHaveTextContent('▼')
    expect(badge).toHaveTextContent('AAV')
  })

  it('featured card applies camel left border style', () => {
    render(<NewsCard news={{ ...VALID_NEWS, featured: true }} />)
    const article = screen.getByRole('article')
    expect(article).toHaveStyle({ borderLeftColor: '#B2967D' })
  })

  it('non-featured card does not apply camel left border', () => {
    render(<NewsCard news={VALID_NEWS} />)
    const article = screen.getByRole('article')
    expect(article).not.toHaveStyle({ borderLeftColor: '#B2967D' })
  })

  it('renders with empty stock_impacts without throwing', () => {
    expect(() => render(<NewsCard news={{ ...VALID_NEWS, stock_impacts: [] }} />)).not.toThrow()
  })

  it('unknown category falls back gracefully', () => {
    render(<NewsCard news={{ ...VALID_NEWS, category: 'อื่นๆ' as never }} />)
    expect(screen.getByText('อื่นๆ')).toBeInTheDocument()
  })

  it('card contains a link navigating to /news/[id]', () => {
    render(<NewsCard news={VALID_NEWS} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/news/news-001')
  })

  it('source name renders as plain text when source_url is null', () => {
    render(<NewsCard news={{ ...VALID_NEWS, source_url: null }} />)
    const sourceEl = screen.getByText('Bloomberg')
    expect(sourceEl).toBeInTheDocument()
    expect(sourceEl.tagName).not.toBe('A')
  })

  it('relative time is shown in the footer', () => {
    render(<NewsCard news={VALID_NEWS} />)
    expect(screen.getByText('2h ago')).toBeInTheDocument()
  })
})
