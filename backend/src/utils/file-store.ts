/**
 * Simple JSON file-based store to replace in-memory Maps.
 * Data persists across server restarts.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { logger } from './logger'

const DATA_DIR = join(__dirname, '..', '..', 'data')

export class FileStore<T = any> {
  private data: Map<string, T>
  private filePath: string
  private dirty = false
  private saveTimer: NodeJS.Timeout | null = null

  constructor(name: string) {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true })
    }
    this.filePath = join(DATA_DIR, `${name}.json`)
    this.data = new Map()
    this.load()
  }

  private load() {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        const entries: [string, T][] = JSON.parse(raw)
        this.data = new Map(entries)
        logger.info(`FileStore loaded: ${this.filePath} (${this.data.size} entries)`)
      }
    } catch (err: any) {
      logger.warn(`FileStore load failed: ${this.filePath}`, { error: err.message })
    }
  }

  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.dirty = true
    this.saveTimer = setTimeout(() => this.flush(), 500)
  }

  flush() {
    if (!this.dirty) return
    try {
      const entries = Array.from(this.data.entries())
      writeFileSync(this.filePath, JSON.stringify(entries, null, 2), 'utf-8')
      this.dirty = false
    } catch (err: any) {
      logger.warn(`FileStore save failed: ${this.filePath}`, { error: err.message })
    }
  }

  get(key: string): T | undefined {
    return this.data.get(key)
  }

  set(key: string, value: T): this {
    this.data.set(key, value)
    this.scheduleSave()
    return this
  }

  has(key: string): boolean {
    return this.data.has(key)
  }

  delete(key: string): boolean {
    const result = this.data.delete(key)
    if (result) this.scheduleSave()
    return result
  }

  values(): IterableIterator<T> {
    return this.data.values()
  }

  entries(): IterableIterator<[string, T]> {
    return this.data.entries()
  }

  forEach(cb: (value: T, key: string) => void) {
    this.data.forEach(cb)
  }

  get size(): number {
    return this.data.size
  }

  clear(): void {
    this.data.clear()
    this.scheduleSave()
  }
}
