import { Page, expect } from '@playwright/test'

export interface LoginOptions {
    retries?: number
    timeout?: number
    waitForSearchInterface?: boolean
}

/**
 * Robust login helper that handles intermittent timeout issues
 * with retry logic and better error handling
 */
export async function loginAsTestUser(page: Page, options: LoginOptions = {}): Promise<void> {
    const {
        retries = 2,
        timeout = 15000,
        waitForSearchInterface = true
    } = options

    const email = process.env.TEST_USER_EMAIL
    const password = process.env.TEST_USER_PASSWORD
    
    if (!email || !password) {
        throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set')
    }

    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            console.log(`🔑 Login attempt ${attempt}/${retries + 1}...`)
            
            // Navigate to email login page with robust waiting
            await page.goto('/login-email', { 
                waitUntil: 'networkidle',
                timeout: timeout 
            })
            
            // Wait for page to be fully loaded
            await page.waitForLoadState('domcontentloaded')
            await page.waitForTimeout(1000) // Small buffer for any dynamic content
            
            // Check if we're already logged in (redirected to main page)
            const currentUrl = page.url()
            if (currentUrl.includes('localhost') && !currentUrl.includes('/login')) {
                console.log('✅ Already logged in, checking for search interface...')
                
                if (waitForSearchInterface) {
                    await expect(page.locator('[placeholder*="Search"]')).toBeVisible({ timeout: 5000 })
                }
                return
            }
            
            // Wait for the login form elements with extended timeout
            console.log('📝 Waiting for login form elements...')
            await Promise.all([
                page.waitForSelector('#email', { timeout: timeout / 2 }),
                page.waitForSelector('#password', { timeout: timeout / 2 }),
                page.waitForSelector('button[type="submit"]', { timeout: timeout / 2 })
            ])
            
            // Clear any existing values and fill form
            console.log('📝 Filling login form...')
            await page.locator('#email').clear()
            await page.locator('#password').clear()
            
            await page.fill('#email', email, { timeout: 5000 })
            await page.fill('#password', password, { timeout: 5000 })
            
            // Verify form is filled correctly
            await expect(page.locator('#email')).toHaveValue(email)
            await expect(page.locator('#password')).toHaveValue(password)
            
            console.log('🔐 Submitting login form...')
            await page.click('button[type="submit"]', { timeout: 5000 })
            
            // Wait for authentication and potential navigation
            await page.waitForTimeout(3000)
            
            // Check for successful login by looking for main page elements
            if (waitForSearchInterface) {
                console.log('🔍 Waiting for search interface...')
                await expect(page.locator('[placeholder*="Search"]')).toBeVisible({ timeout: 10000 })
            }
            
            // Additional verification that we're on the main page
            const finalUrl = page.url()
            if (finalUrl.includes('/login')) {
                throw new Error('Still on login page after authentication attempt')
            }
            
            console.log('✅ Login successful!')
            return
            
        } catch (error) {
            lastError = error as Error
            console.log(`❌ Login attempt ${attempt} failed:`, error)
            
            if (attempt <= retries) {
                console.log(`🔄 Retrying login (attempt ${attempt + 1}/${retries + 1})...`)
                
                // Take screenshot for debugging
                try {
                    const screenshot = await page.screenshot({ fullPage: true })
                    console.log('📷 Screenshot taken for debugging')
                } catch (screenshotError) {
                    console.log('📷 Could not take screenshot:', screenshotError)
                }
                
                // Wait before retry
                await page.waitForTimeout(2000)
                
                // Try to navigate away and back to reset state
                await page.goto('about:blank')
                await page.waitForTimeout(1000)
            }
        }
    }
    
    // If all attempts failed, throw the last error
    throw new Error(`Login failed after ${retries + 1} attempts. Last error: ${lastError?.message}`)
}

/**
 * Quick check if user is already authenticated
 */
export async function isUserLoggedIn(page: Page): Promise<boolean> {
    try {
        const currentUrl = page.url()
        
        // If we're on a login page, we're not logged in
        if (currentUrl.includes('/login')) {
            return false
        }
        
        // Check for search interface (main indicator of being logged in)
        const searchInput = page.locator('[placeholder*="Search"]')
        const isSearchVisible = await searchInput.isVisible({ timeout: 2000 }).catch(() => false)
        
        if (isSearchVisible) {
            return true
        }
        
        // Check for user email in header
        const userEmail = page.locator('text=test@instamem.local')
        const isUserEmailVisible = await userEmail.isVisible({ timeout: 2000 }).catch(() => false)
        
        return isUserEmailVisible
    } catch {
        return false
    }
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
    try {
        // First try to open user menu
        const partialEmail = page.locator('text=test@')
        if (await partialEmail.isVisible({ timeout: 5000 }).catch(() => false)) {
            await partialEmail.click()
            await page.waitForTimeout(500)
        }
        
        const signOutButton = page.locator('text=Sign out')
        if (await signOutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await signOutButton.click()
            await page.waitForTimeout(2000)
        }
    } catch (error) {
        console.log('⚠️ Logout failed or already logged out:', error)
    }
}