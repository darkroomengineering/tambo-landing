'use client'

import { createContext } from 'react'
import type { BackgroundItemRef } from '.'

export const BackgroundContext = createContext<{
  getItems: () => BackgroundItemRef[] | null[]
}>({
  getItems: () => [],
})
