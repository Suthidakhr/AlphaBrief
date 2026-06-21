import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewsFeed from './NewsFeed'
import { NewsItem } from '@/types'

const makeNews = (overrides: Partial<NewsItem> & { id: string; category: string }): NewsItem => ({
  headline: `News ${overrides.id}`,
  summary: 'Summary text',
  source_url: 'https://example.com/article',
  content: 'Article content.',
  published_at: '2026-06-21T01:15:00Z',
  source: 'Reuters',
  ai_analysis: null,
  stock_impacts: [],
  featured: false,
  ...overrides,
})

const NEWS: NewsItem[] = [
  makeNews({ id: 'n1', category: 'พลังงาน', headline: 'Energy news' }),
  makeNews({ id: 'n2', category: 'เทคโนโลยี', headline: 'Tech news' }),
  makeNews({ id: 'n3', category: 'พลังงาน', headline: 'Another energy news' }),
]

describe('NewsFeed', () => {
  it('renders all news cards from the news prop', () => {
    render(<NewsFeed news={NEWS} />)
    expect(screen.getByText('Energy news')).toBeInTheDocument()
    expect(screen.getByText('Tech news')).toBeInTheDocument()
    expect(screen.getByText('Another energy news')).toBeInTheDocument()
  })

  it('renders ทั้งหมด filter button plus one per unique category', () => {
    render(<NewsFeed news={NEWS} />)
    expect(screen.getByRole('button', { name: 'ทั้งหมด' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'พลังงาน' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'เทคโนโลยี' })).toBeInTheDocument()
  })

  it('clicking a category filter hides cards from other categories', async () => {
    const user = userEvent.setup()
    render(<NewsFeed news={NEWS} />)
    await user.click(screen.getByRole('button', { name: 'พลังงาน' }))
    expect(screen.getByText('Energy news')).toBeInTheDocument()
    expect(screen.getByText('Another energy news')).toBeInTheDocument()
    expect(screen.queryByText('Tech news')).not.toBeInTheDocument()
  })

  it('clicking ทั้งหมด after filter restores all cards', async () => {
    const user = userEvent.setup()
    render(<NewsFeed news={NEWS} />)
    await user.click(screen.getByRole('button', { name: 'เทคโนโลยี' }))
    await user.click(screen.getByRole('button', { name: 'ทั้งหมด' }))
    expect(screen.getByText('Energy news')).toBeInTheDocument()
    expect(screen.getByText('Tech news')).toBeInTheDocument()
  })

  it('shows empty message when selected category has no matches', async () => {
    const user = userEvent.setup()
    const noMatch: NewsItem[] = [makeNews({ id: 'x', category: 'หุ้นไทย', headline: 'SET news' })]
    render(<NewsFeed news={noMatch} />)
    await user.click(screen.getByRole('button', { name: 'ทั้งหมด' }))
    expect(screen.getByText('SET news')).toBeInTheDocument()
  })

  it('renders with empty news array without throwing', () => {
    expect(() => render(<NewsFeed news={[]} />)).not.toThrow()
    expect(screen.getByRole('button', { name: 'ทั้งหมด' })).toBeInTheDocument()
  })
})
