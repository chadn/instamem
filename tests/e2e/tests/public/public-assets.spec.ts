import { test, expect } from '@playwright/test'

test.describe('Public Assets Accessibility', () => {
    test('public assets are accessible without authentication', async ({ page }) => {
        console.log('🌐 Testing public assets accessibility...')
        
        // Test PWA manifest
        const manifestResponse = await page.request.get('/manifest.json')
        expect(manifestResponse.status()).toBe(200)
        
        const manifestContent = await manifestResponse.json()
        expect(manifestContent.name).toBe('InstaMem - Personal Memory Assistant')
        console.log('✅ manifest.json accessible and valid')
        
        // Test service worker
        const swResponse = await page.request.get('/sw.js')
        expect(swResponse.status()).toBe(200)
        console.log('✅ sw.js accessible')
        
        // Test SVG assets
        const nextSvgResponse = await page.request.get('/next.svg')
        expect(nextSvgResponse.status()).toBe(200)
        console.log('✅ SVG assets accessible')
        
        // Test that these don't redirect to login
        const globeSvgResponse = await page.request.get('/globe.svg')
        expect(globeSvgResponse.status()).toBe(200)
        expect(globeSvgResponse.url()).not.toContain('/login')
        console.log('✅ Public assets do not redirect to login')
        
        console.log('✅ All public assets properly accessible without authentication')
    })
    
    test('PWA manifest contains correct configuration', async ({ page }) => {
        console.log('📱 Testing PWA manifest configuration...')
        
        const response = await page.request.get('/manifest.json')
        const manifest = await response.json()
        
        // Verify essential PWA properties
        expect(manifest.name).toBeTruthy()
        expect(manifest.short_name).toBeTruthy()
        expect(manifest.start_url).toBe('/')
        expect(manifest.display).toBe('standalone')
        expect(manifest.scope).toBe('/')
        
        // Verify icons are defined
        expect(manifest.icons).toBeDefined()
        expect(manifest.icons.length).toBeGreaterThan(0)
        
        // Verify categories and shortcuts
        expect(manifest.categories).toContain('productivity')
        expect(manifest.shortcuts).toBeDefined()
        expect(manifest.shortcuts.length).toBeGreaterThan(0)
        
        console.log('✅ PWA manifest properly configured')
    })
    
    test('service worker is valid JavaScript', async ({ page }) => {
        console.log('⚙️ Testing service worker validity...')
        
        const response = await page.request.get('/sw.js')
        expect(response.status()).toBe(200)
        
        const swContent = await response.text()
        
        // Basic validation that it's JavaScript
        expect(swContent).toContain('self.addEventListener')
        expect(swContent).toContain('InstaMem Service Worker')
        
        // Verify it has basic service worker events
        expect(swContent).toContain('install')
        expect(swContent).toContain('fetch')
        
        console.log('✅ Service worker is valid JavaScript with required events')
    })
})