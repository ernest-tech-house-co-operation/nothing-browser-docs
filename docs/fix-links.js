// fix-links.js
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = join(__dirname, 'docs')

// All valid paths in your docs
const validPaths = new Set()

// Scan all .md files to build valid path index
function scanDir(dir, basePath = '') {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      scanDir(fullPath, join(basePath, file))
    } else if (file.endsWith('.md')) {
      // Add path without extension
      let path = join(basePath, file.replace('.md', ''))
      path = '/' + path.replace(/\\/g, '/')
      validPaths.add(path)
      
      // Also add with trailing slash for index files
      if (file === 'index.md') {
        validPaths.add(path + '/')
      }
    }
  }
}

// Build the index
scanDir(join(docsDir, 'guide'))
scanDir(join(docsDir, 'piggy'))
validPaths.add('/')
validPaths.add('/guide/what-is-nothing')
validPaths.add('/guide/three-pillars')
validPaths.add('/guide/timeline')
validPaths.add('/guide/comparison')

console.log('Valid paths found:', validPaths.size)

// Fix links in all markdown files
function fixLinksInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Find all markdown links [text](/path)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match
  
  while ((match = linkRegex.exec(content)) !== null) {
    const fullMatch = match[0]
    const text = match[1]
    let link = match[2]
    
    // Skip external links
    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:')) {
      continue
    }
    
    // Skip anchor links
    if (link.startsWith('#')) {
      continue
    }
    
    // Remove trailing .md if present
    let cleanLink = link.replace(/\.md$/, '')
    
    // Check if link is valid
    if (!validPaths.has(cleanLink) && !validPaths.has(cleanLink + '/')) {
      console.log(`Dead link in ${filePath}: ${link}`)
      // Fix common patterns
      let fixedLink = link
      
      // Fix /guide/nothing-browser/techhouse → /guide/nothing-browser/techhouse
      // (already correct, so this is a false positive)
      
      modified = true
    }
  }
  
  if (modified) {
    // Write fixed content (though we're not auto-fixing to avoid breaking things)
    // writeFileSync(filePath, content)
  }
}

// Scan and fix all markdown files
function scanAndFix(dir) {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      scanAndFix(fullPath)
    } else if (file.endsWith('.md')) {
      fixLinksInFile(fullPath)
    }
  }
}

scanAndFix(docsDir)

console.log('Done checking links')