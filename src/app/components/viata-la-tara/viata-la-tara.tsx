'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@headlessui/react'
import { Trash2, X, Maximize2, Minimize2 } from 'lucide-react'
import Image from 'next/image'
import styles from './viata-la-tara.module.css'

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

    useEffect(() => {
        fetch('/images/images.json')
            .then(response => response.json())
            .then((data: ImageData[]) => setImagesData(data))
            .catch(error => console.error('Error loading images:', error))
    }, [])

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

    const handleSearch = () => {
        if (!query.trim()) {
            setDisplayedImages([])
            setPendingImages([])
            setIsLoading(false)
            return
        }

        const searchTerm = query.toLowerCase().trim()
        const matchingImages = imagesData.filter(image => 
            image.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )

        const newPendingImages: DisplayedImage[] = matchingImages.map(image => ({
            filename: image.filename,
            id: `${image.filename}-${Date.now()}-${Math.random()}`,
            loaded: false,
            isFullscreen: false,
            ...getRandomPosition()
        }))

        setDisplayedImages([])
        setPendingImages(newPendingImages)
        setIsLoading(true)
        
        if (newPendingImages.length > 0) {
            loadNextImage(newPendingImages)
        }
    }

    const loadNextImage = (remaining: DisplayedImage[]) => {
        if (remaining.length === 0) {
            setIsLoading(false)
            return
        }

        const [currentImage, ...restImages] = remaining
        const imageToLoad = { ...currentImage, loaded: true }
        
        setDisplayedImages(prev => [...prev, imageToLoad])
        setPendingImages(restImages)

        setTimeout(() => {
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
            
            <button className={styles.trashButton} onClick={clearImages}>
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
