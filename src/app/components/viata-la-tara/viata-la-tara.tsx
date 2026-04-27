'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@headlessui/react'
import { Trash2, X, Maximize2, Minimize2 } from 'lucide-react'
import Image from 'next/image'
import styles from './viata-la-tara.module.css'

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'of', 'in', 'to', 'and', 'is', 'it', 'on',
    'at', 'by', 'or', 'as', 'be', 'if', 'no', 'do', 's', 'for',
    'from', 'with', 'that', 'this', 'was', 'are', 'but', 'not',
    'you', 'all', 'can', 'had', 'her', 'his', 'one', 'our', 'out',
    'b'
])

interface ImageData {
    filename: string;
    tags: string[];
}

interface DisplayedImage {
    filename: string;
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    loaded: boolean;
    isFullscreen: boolean;
    originalX?: number;
    originalY?: number;
}

export default function ViataLaTara() {
    const [query, setQuery] = useState('')
    const [imagesData, setImagesData] = useState<ImageData[]>([])
    const [displayedImages, setDisplayedImages] = useState<DisplayedImage[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pendingImages, setPendingImages] = useState<DisplayedImage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [draggedImage, setDraggedImage] = useState<string | null>(null)
    const [lastDraggedImage, setLastDraggedImage] = useState<string | null>(null)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const containerRef = useRef<HTMLDivElement>(null)
    const [animatedPlaceholder, setAnimatedPlaceholder] = useState('')
    const [hasInteracted, setHasInteracted] = useState(false)
    const placeholderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isMountedRef = useRef(true)

    useEffect(() => {
        fetch('/images/images.json')
            .then(response => response.json())
            .then((data: ImageData[]) => setImagesData(data))
            .catch(error => console.error('Error loading images:', error))
    }, [])

    useEffect(() => {
        return () => {
            isMountedRef.current = false
            if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current)
            if (placeholderTimerRef.current) clearTimeout(placeholderTimerRef.current)
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
        }
    }, [])

    // Animated placeholder hint - types out after 3s of no interaction
    useEffect(() => {
        if (hasInteracted) return

        placeholderTimerRef.current = setTimeout(() => {
            const hintText = 'try searching for "cat"'
            let charIndex = 0
            typingIntervalRef.current = setInterval(() => {
                charIndex++
                if (charIndex <= hintText.length) {
                    setAnimatedPlaceholder(hintText.slice(0, charIndex))
                } else {
                    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
                }
            }, 60)
        }, 3000)

        return () => {
            if (placeholderTimerRef.current) clearTimeout(placeholderTimerRef.current)
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
        }
    }, [hasInteracted])

    const handleInputFocus = () => {
        if (!hasInteracted) {
            setHasInteracted(true)
            setAnimatedPlaceholder('')
            if (placeholderTimerRef.current) clearTimeout(placeholderTimerRef.current)
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
        }
    }

    const toSearchTerms = (text: string): string[] => {
        return text.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0 && !STOP_WORDS.has(w))
    }

    const matchImages = (terms: string[]): ImageData[] => {
        return imagesData.filter(image => {
            const tags = Array.isArray(image.tags) ? image.tags : []
            const meaningfulTags = tags
                .map(tag => tag.toLowerCase())
                .filter(tag => !STOP_WORDS.has(tag))
            return terms.some(term =>
                meaningfulTags.some(tag => {
                    if (tag === term) return true
                    if (term.length >= 3 && tag.startsWith(term)) return true
                    return false
                })
            )
        })
    }

    const translateToEnglish = async (text: string): Promise<string[]> => {
        try {
            const res = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=autodetect|en`
            )
            if (!res.ok) return []

            const data = await res.json()
            const translatedText = data?.responseData?.translatedText
            if (typeof translatedText !== 'string') return []

            const translated = translatedText.toLowerCase().trim()
            if (translated && translated !== text.toLowerCase().trim()) {
                return toSearchTerms(translated)
            }
        } catch {
            // Translation failed silently
        }
        return []
    }

    const getRandomPosition = () => {
        const containerWidth = window.innerWidth
        const containerHeight = window.innerHeight
        const maxSize = Math.random() * 200 + 250
        
        return {
            x: Math.random() * (containerWidth - maxSize),
            y: Math.random() * (containerHeight - maxSize),
            width: maxSize,
            height: maxSize
        }
    }

    const handleSearch = async () => {
        if (!query.trim()) {
            setDisplayedImages([])
            setPendingImages([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        const originalTerms = toSearchTerms(query.trim())

        if (originalTerms.length === 0) {
            setDisplayedImages([])
            setPendingImages([])
            setIsLoading(false)
            return
        }

        // Try original terms first
        let matchingImages = matchImages(originalTerms)

        // If no results, try translating to English and search again
        if (matchingImages.length === 0) {
            const translatedTerms = await translateToEnglish(query.trim())
            if (translatedTerms.length > 0) {
                matchingImages = matchImages(translatedTerms)
            }
        }

        const newPendingImages: DisplayedImage[] = matchingImages.map(image => ({
            filename: image.filename,
            id: `${image.filename}-${Date.now()}-${Math.random()}`,
            loaded: false,
            isFullscreen: false,
            ...getRandomPosition()
        }))

        setDisplayedImages([])
        setPendingImages(newPendingImages)

        if (newPendingImages.length > 0) {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current)
            }
            loadNextImage(newPendingImages)
        } else {
            setIsLoading(false)
        }
    }

    const loadNextImage = (remaining: DisplayedImage[]) => {
        if (remaining.length === 0) {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
            return
        }

        const [currentImage, ...restImages] = remaining
        const imageToLoad = { ...currentImage, loaded: true }
        
        setDisplayedImages(prev => [...prev, imageToLoad])
        setPendingImages(restImages)

        loadTimeoutRef.current = setTimeout(() => {
            loadTimeoutRef.current = null
            if (!isMountedRef.current) return
            loadNextImage(restImages)
        }, 150)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const clearImages = () => {
        setDisplayedImages([])
        setPendingImages([])
        setIsLoading(false)
        setLastDraggedImage(null)
    }

    const handleMouseDown = (e: React.MouseEvent, imageId: string) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        setDraggedImage(imageId)
        setLastDraggedImage(imageId)
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedImage) return

        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        setDisplayedImages(prev => prev.map(img => 
            img.id === draggedImage 
                ? { ...img, x: newX, y: newY }
                : img
        ))
    }

    const handleMouseUp = () => {
        setDraggedImage(null)
        setDragOffset({ x: 0, y: 0 })
    }

    const removeImage = (imageId: string) => {
        setDisplayedImages(prev => prev.filter(img => img.id !== imageId))
        if (lastDraggedImage === imageId) {
            setLastDraggedImage(null)
        }
    }

    const toggleFullscreen = (imageId: string) => {
        setDisplayedImages(prev => prev.map(img => 
            img.id === imageId 
                ? { 
                    ...img, 
                    isFullscreen: !img.isFullscreen,
                    originalX: !img.isFullscreen ? img.x : img.originalX,
                    originalY: !img.isFullscreen ? img.y : img.originalY,
                    x: !img.isFullscreen ? 0 : (img.originalX ?? img.x),
                    y: !img.isFullscreen ? 0 : (img.originalY ?? img.y)
                }
                : img
        ))
    }

    return (
        <div 
            className={styles.container}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div className={styles.searchWrapper}>
                <input
                    type="text"
                    className={styles.searchInput}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    placeholder={animatedPlaceholder}
                    disabled={isLoading}
                />
                <Button 
                    className={styles.searchButton} 
                    onClick={handleSearch}
                    disabled={isLoading}
                >
                    Search
                </Button>
            </div>
            
            <button className={styles.trashButton} onClick={clearImages} aria-label="Clear images">
                <Trash2 size={20} />
            </button>

            {displayedImages.map((img) => (
                <div
                    key={img.id}
                    className={`${styles.imageContainer} ${img.isFullscreen ? styles.fullscreen : ''} ${draggedImage === img.id ? styles.dragging : ''}`}
                    style={{
                        left: img.x,
                        top: img.y,
                        maxWidth: img.isFullscreen ? '100vw' : img.width,
                        maxHeight: img.isFullscreen ? '100vh' : img.height,
                        width: img.isFullscreen ? '100vw' : 'auto',
                        height: img.isFullscreen ? '100vh' : 'auto',
                        zIndex: img.isFullscreen ? 2000 : 
                               (draggedImage === img.id ? 999 : 
                               (lastDraggedImage === img.id ? 100 : 5)),
                    }}
                    onMouseDown={(e) => handleMouseDown(e, img.id)}
                >
                    <div className={styles.imageControls}>
                        <button
                            className={styles.controlButton}
                            onClick={() => removeImage(img.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <X size={16} />
                        </button>
                        <button
                            className={styles.controlButton}
                            onClick={() => toggleFullscreen(img.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {img.isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                    <Image
                        src={`/images/${img.filename}`}
                        alt="Search result"
                        width={img.isFullscreen ? 1920 : img.width}
                        height={img.isFullscreen ? 1080 : img.height}
                        className={styles.searchResultImage}
                        draggable={false}
                    />
                </div>
            ))}
        </div>
    )
}
