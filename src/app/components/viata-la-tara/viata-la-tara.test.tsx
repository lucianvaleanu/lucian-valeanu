import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ViataLaTara from './viata-la-tara'

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  )
}))

vi.mock('@headlessui/react', () => ({
  Button: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button type="button" {...props}>
      {children}
    </button>
  )
}))

describe('ViataLaTara', () => {
  const imagesData = [
    { filename: 'cat.png', tags: ['cat', 'animal'] },
    { filename: 'dog.png', tags: ['dog', 'pet'] }
  ]

  const mockFetch = (translation?: string) => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input: string | URL | Request) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      if (url.endsWith('/images/images.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(imagesData)
        } as Response)
      }

      if (url.includes('api.mymemory.translated.net')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ responseData: { translatedText: translation ?? '' } })
        } as Response)
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`))
    })
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('displays search results for a matching query', async () => {
    mockFetch()

    const { container, getByRole } = render(<ViataLaTara />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))

    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    const [button] = screen.getAllByRole('button', { name: /search/i })

    fireEvent.change(input, { target: { value: 'cat' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.queryByAltText('Search result')).toBeTruthy()
    })
  })

  it('falls back to translated terms when no direct match exists', async () => {
    mockFetch('cat')

    const { container, getByRole } = render(<ViataLaTara />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))

    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    const [button] = screen.getAllByRole('button', { name: /search/i })

    fireEvent.change(input, { target: { value: 'gato' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.queryByAltText('Search result')).toBeTruthy()
    })
  })

  it('clears displayed images when the trash button is clicked', async () => {
    mockFetch()

    const { container, getByRole } = render(<ViataLaTara />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))

    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    const [searchButton] = screen.getAllByRole('button', { name: /search/i })

    fireEvent.change(input, { target: { value: 'cat' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.queryByAltText('Search result')).toBeTruthy()
    })

    const [trashButton] = screen.getAllByRole('button', { name: /clear images/i })
    fireEvent.click(trashButton)

    await waitFor(() => {
      expect(screen.queryByAltText('Search result')).toBeNull()
    })
  })
})
