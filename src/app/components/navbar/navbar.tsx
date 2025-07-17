'use client'

import { Tab } from '@headlessui/react'
import styles from './navbar.module.css'

interface NavbarProps {
  onNavigate: (page: 'home' | 'about' | 'viata-la-tara') => void
  currentPage: 'home' | 'about' | 'viata-la-tara'
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const tabs = [
    { key: 'home' as const, label: 'Home' },
    { key: 'about' as const, label: 'About Me' },
    { key: 'viata-la-tara' as const, label: 'Viața la Țară' }
  ]

  const selectedIndex = tabs.findIndex(tab => tab.key === currentPage)

  return (
    <div className={styles.navbar}>
      <Tab.Group selectedIndex={selectedIndex} onChange={(index) => onNavigate(tabs[index].key)}>
        <Tab.List className={styles.tabList}>
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                selected ? `${styles.tab} ${styles.tabSelected}` : styles.tab
              }
            >
              {tab.label}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
    </div>
  )
}
