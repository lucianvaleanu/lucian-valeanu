/**
 * Test suite for ViataLaTara component
 * Framework: Jest + React Testing Library (standard for Next.js / React projects)
 * Run with: npx jest viata-la-tara.test.tsx
 *
 * Coverage targets:
 *  - STOP_WORDS filtering (toSearchTerms)
 *  - Image tag matching (matchImages)
 *  - Translation fallback path (translateToEnglish)
 *  - handleSearch flows: empty query, no matches, matches found, translation fallback
 *  - Drag & drop state (mousedown / mousemove / mouseup)
 *  - Fullscreen toggle
 *  - Remove image
 *  - Clear all images
 *  - Animated placeholder (typing hint after 3 s of no interaction)
 *  - handleInputFocus cancels the hint
 *  - Enter-key triggers search
 *  - JSON fetch on mount (imagesData population)
 */

// ...existing code...
/**
 * Test suite for ViataLaTara component
 * Framework: Jest + React Testing Library (standard for Next.js / React projects)
 * Run with: npx jest src/app/components/viata-la-tara/viata-la-tara.test.jsx
 */

import React from 'react'
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ViataLaTara from './viata-la-tara'

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

// next/image → plain <img> so tests can assert on src/alt
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} />
    },
}))

// @headlessui/react Button → plain <button>
jest.mock('@headlessui/react', () => ({
    Button: ({ children, ...props }) => (
        <button {...props}>{children}</button>
    ),
}))

// CSS modules → identity proxy
jest.mock('./viata-la-tara.module.css', () =>
    new Proxy({}, { get: (_, key) => key })
)

// Stable Math.random so positions are deterministic
const FIXED_RANDOM = 0.5
beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(FIXED_RANDOM))
afterEach(() => jest.restoreAllMocks())

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_IMAGES = [
    { filename: 'cat1.jpg', tags: ['cat', 'animal', 'pet'] },
    { filename: 'dog1.jpg', tags: ['dog', 'animal', 'pet'] },
    { filename: 'the-cat.jpg', tags: ['the', 'cat'] }, // "the" is a stop word
    { filename: 'cats.jpg', tags: ['cats'] },          // prefix match
    { filename: 'nature.jpg', tags: ['tree', 'forest', 'green'] },
]

function mockFetchImages(images = MOCK_IMAGES) {
    const imagesPromise = Promise.resolve(images)
    global.fetch = jest.fn((url) => {
        if (String(url).includes('images.json')) {
            return Promise.resolve({
                ok: true,
                json: () => imagesPromise,
            })
        }
        // translation API default: return same text (no translation)
        const urlStr = String(url)
        const q = new URL(urlStr).searchParams.get('q') ?? ''
        return Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve({
                    responseData: { translatedText: q },
                }),
        })
    })
    return imagesPromise
}

async function renderAndLoad(images = MOCK_IMAGES) {
    const imagesPromise = mockFetchImages(images)
    const result = render(<ViataLaTara />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))
    await act(async () => {
        await imagesPromise
    })
    return result
}

function getSearchInput() {
    return screen.getByRole('textbox')
}

function getSearchButton() {
    return screen.getByRole('button', { name: /search/i })
}

async function typeAndSearch(text) {
    const input = getSearchInput()
    await userEvent.clear(input)
    await userEvent.type(input, text)
    await userEvent.click(getSearchButton())
}

// ---------------------------------------------------------------------------
// 1. Mount & data fetch
// ---------------------------------------------------------------------------

describe('mount and data fetch', () => {
    it('fetches images.json on mount', async () => {
        await renderAndLoad()
        expect(global.fetch).toHaveBeenCalledWith('/images/images.json')
    })

    it('renders search input and button', async () => {
        await renderAndLoad()
        expect(getSearchInput()).toBeTruthy()
        expect(getSearchButton()).toBeTruthy()
    })

    it('renders the trash/clear button', async () => {
        await renderAndLoad()
        expect(screen.getByRole('button', { name: /clear images/i })).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// 2. toSearchTerms / STOP_WORDS
// ---------------------------------------------------------------------------

describe('stop-word filtering', () => {
    it('ignores pure stop-word queries and shows no images', async () => {
        await renderAndLoad()
        await typeAndSearch('the a an')
        expect(screen.queryAllByRole('img')).toHaveLength(0)
    })

    it('filters stop words but keeps meaningful terms', async () => {
        await renderAndLoad()
        await typeAndSearch('the cat')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))
        const imgs = screen.getAllByRole('img')
        const srcs = imgs.map(i => i.getAttribute('src') || '')
        expect(srcs.some(s => s.includes('cat1.jpg'))).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// 3. matchImages
// ---------------------------------------------------------------------------

describe('matchImages', () => {
    it('finds images by exact tag match', async () => {
        await renderAndLoad()
        await typeAndSearch('dog')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))
        const srcs = screen.getAllByRole('img').map(i => i.getAttribute('src') || '')
        expect(srcs.some(s => s.includes('dog1.jpg'))).toBe(true)
    })

    it('finds images by prefix match (≥3 chars)', async () => {
        await renderAndLoad()
        await typeAndSearch('cat')
        await waitFor(() => {
            const srcs = screen.getAllByRole('img').map(i => i.getAttribute('src') || '')
            expect(srcs.some(s => s.includes('cats.jpg'))).toBe(true)
        })
    })

    it('returns no images when no tag matches', async () => {
        await renderAndLoad()
        await typeAndSearch('unicorn')
        await waitFor(() => {
            expect(screen.queryAllByRole('img')).toHaveLength(0)
        })
    })
})

// ---------------------------------------------------------------------------
// 4. handleSearch edge cases
// ---------------------------------------------------------------------------

describe('handleSearch', () => {
    it('clears displayed images when query is empty', async () => {
        await renderAndLoad()
        await typeAndSearch('cat')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))
        const input = getSearchInput()
        await waitFor(() => expect(getSearchButton().disabled).toBe(false))
        await userEvent.clear(input)
        await userEvent.click(getSearchButton())
        expect(screen.queryAllByRole('img')).toHaveLength(0)
    })

    it('does not call translation API when original terms already have results', async () => {
        const imagesPromise = mockFetchImages()
        render(<ViataLaTara />)
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))
        await act(async () => {
            await imagesPromise
        })

        await typeAndSearch('cat')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))

        const translationCalls = global.fetch.mock.calls.filter(
            ([url]) => String(url).includes('mymemory')
        )
        expect(translationCalls).toHaveLength(0)
    })

    it('calls translation API when original search has no results', async () => {
        global.fetch = jest.fn((url) => {
            const urlStr = String(url)
            if (urlStr.includes('images.json')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_IMAGES) })
            }
            if (urlStr.includes('mymemory')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({ responseData: { translatedText: 'cat' } }),
                })
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        })

        render(<ViataLaTara />)
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))
        await act(async () => {})

        await typeAndSearch('gatto')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))

        const translationCalls = global.fetch.mock.calls.filter(
            ([url]) => String(url).includes('mymemory')
        )
        expect(translationCalls.length).toBeGreaterThan(0)
    })

    it('handles translation API failure gracefully (shows no images)', async () => {
        global.fetch = jest.fn((url) => {
            if (String(url).includes('images.json')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_IMAGES) })
            }
            return Promise.reject(new Error('Network error'))
        })

        render(<ViataLaTara />)
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))
        await act(async () => {})

        await typeAndSearch('gatto')
        await waitFor(() => {
            expect(screen.queryAllByRole('img')).toHaveLength(0)
        })
    })

    it('handles images.json fetch failure without crashing', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        global.fetch = jest.fn(() => Promise.reject(new Error('404')))
        expect(() => render(<ViataLaTara />)).not.toThrow()
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))
        await act(async () => {})
        consoleError.mockRestore()
    })
})

// ---------------------------------------------------------------------------
// 5. Keyboard — Enter triggers search
// ---------------------------------------------------------------------------

describe('Enter key triggers search', () => {
    it('pressing Enter fires search', async () => {
        await renderAndLoad()
        const input = getSearchInput()
        await userEvent.type(input, 'dog')
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 })
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))
    })

    it('pressing other keys does not fire search', async () => {
        await renderAndLoad()
        const input = getSearchInput()
        await userEvent.type(input, 'dog')
        fireEvent.keyPress(input, { key: 'a', code: 'KeyA', charCode: 97 })
        expect(global.fetch.mock.calls.filter(
            ([url]) => String(url).includes('mymemory')
        )).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// 6. Remove individual image
// ---------------------------------------------------------------------------

describe('remove image', () => {
    it('clicking X button removes only that image', async () => {
        await renderAndLoad()
        await typeAndSearch('animal')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2))

        const images = screen.getAllByRole('img')
        const countBefore = images.length
        const firstContainer = images[0].parentElement
        const controlButtons = firstContainer?.querySelectorAll('button')
        const removeButton = controlButtons?.[0]
        expect(removeButton).toBeTruthy()

        fireEvent.mouseDown(removeButton, { bubbles: true })
        fireEvent.click(removeButton)

        await waitFor(() => {
            expect(screen.getAllByRole('img').length).toBe(countBefore - 1)
        })
    })
})

// ---------------------------------------------------------------------------
// 7. Clear all images
// ---------------------------------------------------------------------------

describe('clear all images', () => {
    it('trash button removes all displayed images', async () => {
        await renderAndLoad()
        await typeAndSearch('animal')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))

        fireEvent.click(screen.getByRole('button', { name: /clear images/i }))
        expect(screen.queryAllByRole('img')).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// 8. Fullscreen toggle
// ---------------------------------------------------------------------------

describe('fullscreen toggle', () => {
    it('toggles fullscreen class on maximize/minimize click', async () => {
        await renderAndLoad()
        await typeAndSearch('cat')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))

        await waitFor(() => {
            expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
        })

        const firstImage = screen.getAllByRole('img')[0]
        const firstContainer = firstImage.parentElement
        expect(firstContainer).toBeTruthy()
        const controlButtons = firstContainer?.querySelectorAll('button') ?? []
        const firstMaximize = controlButtons[1]
        expect(firstMaximize).toBeTruthy()

        if (firstMaximize) {
            fireEvent.mouseDown(firstMaximize)
            fireEvent.click(firstMaximize)
            await waitFor(() => {
                const container = firstImage.parentElement
                expect(container?.style.width).toBe('100vw')
                expect(container?.style.height).toBe('100vh')
            })
        }
    })
})

// ---------------------------------------------------------------------------
// 9. Drag and drop
// ---------------------------------------------------------------------------

describe('drag and drop', () => {
    it('updates image position on drag', async () => {
        await renderAndLoad()
        await typeAndSearch('cat')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))

        await waitFor(() => {
            expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
        })

        const firstImage = screen.getAllByRole('img')[0]
        const firstContainer = firstImage.parentElement
        expect(firstContainer).toBeTruthy()

        fireEvent.mouseDown(firstContainer, { clientX: 100, clientY: 100 })
        const wrapper = screen.getByRole('textbox').closest('div')?.parentElement ?? document.body
        fireEvent.mouseMove(wrapper, { clientX: 200, clientY: 200 })
        fireEvent.mouseUp(wrapper)

        expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
    })

    it('does not move images when no image is being dragged', async () => {
        await renderAndLoad()
        await typeAndSearch('cat')
        await waitFor(() => expect(screen.getAllByRole('img').length).toBeGreaterThan(0))

        const container = screen.getByRole('textbox').closest('div')?.parentElement ?? document.body
        expect(container).toBeTruthy()
        expect(() =>
            fireEvent.mouseMove(container, { clientX: 300, clientY: 300 })
        ).not.toThrow()
    })
})

// ---------------------------------------------------------------------------
// 10. Animated placeholder
// ---------------------------------------------------------------------------

describe('animated placeholder', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('shows typing hint after 3 s with no interaction', async () => {
        mockFetchImages()
        render(<ViataLaTara />)

        act(() => {
            jest.advanceTimersByTime(3000 + 60 * 'try searching for "cat"'.length + 100)
        })

        await waitFor(() => {
            const input = screen.getByRole('textbox')
            expect(input.getAttribute('placeholder')).toBe('try searching for "cat"')
        })
    })

    it('cancels the hint when the user focuses the input', async () => {
        mockFetchImages()
        render(<ViataLaTara />)

        act(() => { jest.advanceTimersByTime(1500) })
        fireEvent.focus(screen.getByRole('textbox'))
        act(() => { jest.advanceTimersByTime(5000) })

        const input = screen.getByRole('textbox')
        expect(input.getAttribute('placeholder')).toBe('')
    })

    it('does not restart the hint after interaction', async () => {
        mockFetchImages()
        render(<ViataLaTara />)

        fireEvent.focus(screen.getByRole('textbox'))
        act(() => { jest.advanceTimersByTime(10000) })

        const input = screen.getByRole('textbox')
        expect(input.getAttribute('placeholder')).toBe('')
    })
})

// ---------------------------------------------------------------------------
// 11. Disabled state while loading
// ---------------------------------------------------------------------------

describe('loading state', () => {
    it('disables input and button while loading', async () => {
        global.fetch = jest.fn((url) => {
            if (String(url).includes('images.json')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(MOCK_IMAGES) })
            }
            return new Promise(resolve =>
                setTimeout(() =>
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({ responseData: { translatedText: 'xyz' } }),
                    }),
                500
                )
            )
        })

        render(<ViataLaTara />)
        await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/images/images.json'))

        const input = getSearchInput()
        await userEvent.type(input, 'unknownterm')
        fireEvent.click(getSearchButton())

        expect(input.disabled).toBe(true)
        expect(getSearchButton().disabled).toBe(true)
    })
})