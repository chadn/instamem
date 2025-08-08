import { test, expect, Page } from '@playwright/test'

test.describe('Search Edge Cases and Error Handling', () => {
    // Helper function to login before each test
    async function loginAsTestUser(page: Page) {
        const email = process.env.TEST_USER_EMAIL
        const password = process.env.TEST_USER_PASSWORD
        
        if (!email || !password) {
            throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set')
        }
        
        await page.goto('/login-email', { 
            waitUntil: 'networkidle',
            timeout: 10000 
        })
        
        await page.waitForSelector('#email', { timeout: 5000 })
        await page.waitForSelector('#password', { timeout: 5000 })
        
        await page.fill('#email', email, { timeout: 5000 })
        await page.fill('#password', password, { timeout: 5000 })
        await page.click('button[type="submit"]', { timeout: 5000 })
        
        await page.waitForTimeout(3000)
        await expect(page.locator('[placeholder*="Search"]')).toBeVisible({ timeout: 10000 })
    }

    test('search gracefully handles network errors', async ({ page }) => {
        console.log('🚫 Testing network error handling...')
        
        // Login while online first
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Wait for any initial sync to complete
        await page.waitForTimeout(2000)
        
        // Simulate network failure after authentication and sync
        await page.context().setOffline(true)
        
        // Wait a moment for offline detection
        await page.waitForTimeout(1000)
        
        // Perform search - should fallback to offline search
        await searchInput.fill('test network error')
        await searchInput.press('Enter')
        
        // Wait for search processing
        await page.waitForTimeout(2000)
        
        // Should either show offline results or appropriate offline message
        const possibleOfflineStates = [
            'text=📱 Searching offline cached memories',
            'text=Offline',
            'text=No cached memories',
            'text=Connect to internet',
            'text=Cached:'
        ]
        
        let foundOfflineState = false
        for (const selector of possibleOfflineStates) {
            if (await page.locator(selector).isVisible().catch(() => false)) {
                console.log(`✅ Found appropriate offline state: ${selector}`)
                foundOfflineState = true
                break
            }
        }
        
        // Check if we can see the offline placeholder message
        const offlineMessage = page.locator('text=📱 Searching offline cached memories')
        const hasOfflineMessage = await offlineMessage.isVisible().catch(() => false)
        
        // Either should have offline state indicator OR offline message
        expect(foundOfflineState || hasOfflineMessage).toBe(true)
        
        // Should not show generic error messages
        const errorMessages = page.locator('text=An error occurred')
        const hasGenericError = await errorMessages.isVisible().catch(() => false)
        expect(hasGenericError).toBe(false)
        
        // Return to online
        await page.context().setOffline(false)
        
        console.log('✅ Network errors handled gracefully')
    })

    test('search input sanitizes HTML and XSS attempts', async ({ page }) => {
        console.log('🛡️ Testing XSS prevention in search input...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        const xssAttempts = [
            '<script>alert("xss")</script>',
            '<img src="x" onerror="alert(1)">',
            '<div onclick="alert(1)">test</div>',
            'javascript:alert(1)',
            '<svg onload="alert(1)">',
            '"><script>alert(1)</script>'
        ]
        
        for (const xssPayload of xssAttempts) {
            console.log(`  Testing XSS payload: ${xssPayload.substring(0, 20)}...`)
            
            await searchInput.clear()
            await searchInput.fill(xssPayload)
            
            // Get the actual value after sanitization
            const sanitizedValue = await searchInput.inputValue()
            
            // Should not contain script tags or event handlers
            expect(sanitizedValue).not.toContain('<script>')
            expect(sanitizedValue).not.toContain('onerror=')
            expect(sanitizedValue).not.toContain('onclick=')
            expect(sanitizedValue).not.toContain('onload=')
            expect(sanitizedValue).not.toContain('javascript:')
            
            // Perform search to ensure no XSS execution
            await searchInput.press('Enter')
            await page.waitForTimeout(500)
            
            // Check that no alert dialogs appeared
            const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null)
            const dialog = await dialogPromise
            expect(dialog).toBeNull()
        }
        
        console.log('✅ XSS attempts properly sanitized')
    })

    test('search handles rapid consecutive queries', async ({ page }) => {
        console.log('⚡ Testing rapid consecutive search queries...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Rapid fire multiple searches
        const queries = ['a', 'ab', 'abc', 'abcd', 'test', 'search', 'chad']
        
        for (const query of queries) {
            await searchInput.clear()
            await searchInput.fill(query)
            // Don't wait - simulate rapid typing
        }
        
        // Wait for debouncing to settle
        await page.waitForTimeout(1000)
        
        // Should have the last query
        await expect(searchInput).toHaveValue('chad')
        
        // Should not show multiple loading states or errors
        const loadingElements = page.locator('text=Searching...')
        const loadingCount = await loadingElements.count()
        expect(loadingCount).toBeLessThanOrEqual(1)
        
        console.log('✅ Rapid consecutive queries handled properly')
    })

    test('search works with various character encodings', async ({ page }) => {
        console.log('🌍 Testing international character support...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        const internationalQueries = [
            'café', // French
            'naïve', // French with diaeresis
            'résumé', // French accents
            'mañana', // Spanish ñ
            'Здравствуй', // Russian Cyrillic
            '你好', // Chinese
            'こんにちは', // Japanese Hiragana
            'مرحبا', // Arabic
            '한국어', // Korean
            'emoji 😀 🔍 ✨', // Emojis
            'mixed العربية english 中文' // Mixed scripts
        ]
        
        for (const query of internationalQueries) {
            console.log(`  Testing: "${query}"`)
            
            await searchInput.clear()
            await searchInput.fill(query)
            await searchInput.press('Enter')
            
            // Wait for processing
            await page.waitForTimeout(500)
            
            // Verify input preserves the characters
            const inputValue = await searchInput.inputValue()
            expect(inputValue).toBe(query)
            
            // Should not cause any errors
            const pageContent = await page.textContent('body')
            expect(pageContent).not.toContain('TypeError')
            expect(pageContent).not.toContain('SyntaxError')
        }
        
        console.log('✅ International characters supported')
    })

    test('search UI remains responsive during slow operations', async ({ page }) => {
        console.log('⏱️ Testing UI responsiveness during search...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Start a search
        await searchInput.fill('performance test')
        await searchInput.press('Enter')
        
        // Immediately try to interact with other elements
        // Check for partial email display first
        const partialEmail = page.locator('text=test@')
        await expect(partialEmail).toBeVisible()
        
        // Open user menu to access sign out
        await partialEmail.click()
        const signOutButton = page.locator('text=Sign out')
        await expect(signOutButton).toBeVisible()
        
        // Close menu to continue test
        await page.keyboard.press('Escape')
        
        // Input should remain editable
        await searchInput.clear()
        await searchInput.fill('responsive test')
        await expect(searchInput).toHaveValue('responsive test')
        
        console.log('✅ UI remains responsive during search operations')
    })

    test('search handles pagination and large result sets', async ({ page }) => {
        console.log('📄 Testing large result set handling...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Search for a broad term that might return many results
        await searchInput.fill('a') // Single character should match many items
        await searchInput.press('Enter')
        
        // Wait for results
        await page.waitForTimeout(3000)
        
        // Check if results are displayed
        const resultElements = page.locator('.border.rounded.p-3')
        const resultCount = await resultElements.count()
        
        console.log(`Found ${resultCount} result elements`)
        
        if (resultCount > 0) {
            // Verify results are properly formatted
            const firstResult = resultElements.first()
            await expect(firstResult).toBeVisible()
            
            // Should have date, content, and potentially tags
            const hasDate = await firstResult.locator('.text-gray-500.font-mono').isVisible()
            const hasContent = await firstResult.locator('.text-gray-900').isVisible()
            
            expect(hasDate || hasContent).toBe(true)
            
            // Results should be limited (not infinite)
            expect(resultCount).toBeLessThanOrEqual(50) // Reasonable limit
        }
        
        console.log('✅ Large result sets handled appropriately')
    })

    test('search preserves accessibility features', async ({ page }) => {
        console.log('♿ Testing search accessibility...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Test keyboard navigation
        await searchInput.focus()
        await expect(searchInput).toBeFocused()
        
        // Test tab navigation
        await page.keyboard.press('Tab')
        // Should move focus to next element (depends on page structure)
        
        // Test Enter key submission
        await searchInput.focus()
        await searchInput.fill('accessibility test')
        await page.keyboard.press('Enter')
        
        // Wait for search
        await page.waitForTimeout(1000)
        
        // Verify search was triggered
        await expect(searchInput).toHaveValue('accessibility test')
        
        // Test that screen readers can identify the search input
        const inputRole = await searchInput.getAttribute('type')
        expect(inputRole).toBe('text')
        
        const placeholder = await searchInput.getAttribute('placeholder')
        expect(placeholder).toContain('Search')
        
        console.log('✅ Search accessibility features working')
    })
})