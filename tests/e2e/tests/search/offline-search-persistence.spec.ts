import { test, expect } from '@playwright/test'
import { loginAsTestUser } from '../../helpers/auth-helper'

test.describe('Offline Search Result Persistence', () => {

    test('search results persist when switching from online to offline', async ({ page }) => {
        console.log('🔄 Testing search result persistence during online→offline transition...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Step 1: Perform search while online
        console.log('🔍 Performing online search...')
        await searchInput.click()
        await searchInput.fill('chad')
        await searchInput.press('Enter')
        
        // Wait for search results to load
        await page.waitForTimeout(2000)
        
        // Capture online search state
        const onlineResultsText = await page.locator('text=Found').textContent().catch(() => null)
        console.log(`📊 Online search results: ${onlineResultsText}`)
        
        // Count memory result items (using the border rounded p-3 styling from component)
        const onlineMemoryItems = page.locator('.border.rounded.p-3')
        const onlineResultCount = await onlineMemoryItems.count()
        console.log(`📝 Found ${onlineResultCount} memory items online`)
        
        // Capture the first result content for comparison
        let firstResultContent = ''
        if (onlineResultCount > 0) {
            firstResultContent = await onlineMemoryItems.first().textContent() || ''
            console.log(`📋 First result preview: ${firstResultContent.substring(0, 50)}...`)
        }
        
        // Verify edit buttons are enabled online
        const editButtons = page.locator('[aria-label="Edit memory"]')
        const editButtonCount = await editButtons.count()
        console.log(`✏️ Found ${editButtonCount} edit buttons online`)
        
        if (editButtonCount > 0) {
            const firstEditButton = editButtons.first()
            const isEnabled = await firstEditButton.isEnabled()
            console.log(`✏️ First edit button enabled: ${isEnabled}`)
            expect(isEnabled).toBe(true)
        }
        
        // Step 2: Switch to offline mode
        console.log('🔌 Switching to offline mode...')
        await page.context().setOffline(true)
        
        // Wait a moment for the network state to propagate
        await page.waitForTimeout(1000)
        
        // Step 3: Verify results are still visible and persistent
        console.log('🔍 Verifying search results persist offline...')
        
        // Check that search query is still in input
        await expect(searchInput).toHaveValue('chad')
        
        // Verify the same number of memory items are still visible
        const offlineMemoryItems = page.locator('.border.rounded.p-3')
        const offlineResultCount = await offlineMemoryItems.count()
        console.log(`📝 Memory items offline: ${offlineResultCount}`)
        expect(offlineResultCount).toBe(onlineResultCount)
        
        // Verify the first result content is the same
        if (offlineResultCount > 0) {
            const offlineFirstResultContent = await offlineMemoryItems.first().textContent() || ''
            console.log(`📋 First result offline preview: ${offlineFirstResultContent.substring(0, 50)}...`)
            expect(offlineFirstResultContent).toBe(firstResultContent)
        }
        
        // Step 4: Verify offline indicator appears
        console.log('📱 Checking for offline indicator...')
        const offlineIndicator = page.locator('text=📱 Searching offline cached memories')
        await expect(offlineIndicator).toBeVisible({ timeout: 5000 })
        console.log('✅ Offline indicator is visible')
        
        // Step 5: Verify edit buttons are disabled/greyed out
        console.log('✏️ Checking edit button states offline...')
        const offlineEditButtons = page.locator('[aria-label="Edit memory"]')
        const offlineEditButtonCount = await offlineEditButtons.count()
        expect(offlineEditButtonCount).toBe(editButtonCount)
        
        if (offlineEditButtonCount > 0) {
            const firstOfflineEditButton = offlineEditButtons.first()
            const isDisabled = await firstOfflineEditButton.isDisabled()
            console.log(`✏️ First edit button disabled offline: ${isDisabled}`)
            expect(isDisabled).toBe(true)
            
            // Check that the button has the greyed-out styling
            const buttonClass = await firstOfflineEditButton.getAttribute('class') || ''
            expect(buttonClass).toContain('opacity-50')
            console.log('✅ Edit button has greyed-out styling')
        }
        
        // Step 6: Verify Create Memory button is also disabled
        console.log('➕ Checking Create Memory button state offline...')
        const createButton = page.locator('text=Create Memory')
        if (await createButton.isVisible().catch(() => false)) {
            const isCreateDisabled = await createButton.isDisabled()
            console.log(`➕ Create Memory button disabled offline: ${isCreateDisabled}`)
            expect(isCreateDisabled).toBe(true)
            
            // Check for greyed-out styling
            const createButtonClass = await createButton.getAttribute('class') || ''
            expect(createButtonClass).toContain('bg-gray-400')
            console.log('✅ Create Memory button has greyed-out styling')
        }
        
        // Step 7: Take screenshot for verification
        const screenshot = await page.screenshot({ fullPage: true })
        await test.info().attach('offline-search-persistence', {
            body: screenshot,
            contentType: 'image/png'
        })
        
        // Step 8: Return to online mode and cleanup
        console.log('🌐 Returning to online mode...')
        await page.context().setOffline(false)
        await page.waitForTimeout(1000)
        
        // Verify edit buttons are re-enabled
        if (editButtonCount > 0) {
            const backOnlineEditButton = editButtons.first()
            await expect(backOnlineEditButton).toBeEnabled({ timeout: 5000 })
            console.log('✅ Edit buttons re-enabled when back online')
        }
        
        console.log('✅ Offline search result persistence test completed successfully!')
    })

    test('edit button click behavior when offline vs online', async ({ page }) => {
        console.log('⚡ Testing edit button click behavior in different network states...')
        
        await loginAsTestUser(page)
        
        const searchInput = page.locator('[placeholder*="Search"]')
        
        // Perform search to get results
        await searchInput.fill('chad')
        await searchInput.press('Enter')
        await page.waitForTimeout(2000)
        
        const editButtons = page.locator('[aria-label="Edit memory"]')
        const editButtonCount = await editButtons.count()
        
        if (editButtonCount === 0) {
            console.log('⚠️ No edit buttons found, skipping click behavior test')
            return
        }
        
        // Test online behavior - should navigate to edit page
        console.log('🌐 Testing edit button click while online...')
        const firstEditButton = editButtons.first()
        
        // Click edit button and check if it navigates (we'll cancel navigation)
        await firstEditButton.click()
        
        // Should navigate to edit page or show edit form
        const currentUrl = page.url()
        const isOnEditPage = currentUrl.includes('/edit') || currentUrl.includes('/memory/')
        console.log(`🔗 Navigation to edit page online: ${isOnEditPage}`)
        
        // Go back to search page
        await page.goBack()
        await page.waitForTimeout(1000)
        
        // Switch to offline
        console.log('🔌 Switching to offline and testing edit button click...')
        await page.context().setOffline(true)
        await page.waitForTimeout(1000)
        
        // Verify edit button is disabled and doesn't respond to clicks
        const offlineEditButton = editButtons.first()
        const isDisabled = await offlineEditButton.isDisabled()
        expect(isDisabled).toBe(true)
        
        // Try clicking (should not navigate)
        const urlBeforeClick = page.url()
        await offlineEditButton.click({ force: true }) // Force click even if disabled
        await page.waitForTimeout(1000)
        
        const urlAfterClick = page.url()
        expect(urlAfterClick).toBe(urlBeforeClick)
        console.log('✅ Edit button click prevented when offline')
        
        // Cleanup
        await page.context().setOffline(false)
        
        console.log('✅ Edit button click behavior test completed!')
    })

    test('create memory button behavior when offline', async ({ page }) => {
        console.log('➕ Testing Create Memory button behavior when offline...')
        
        await loginAsTestUser(page)
        
        // Check if Create Memory button is visible (when no search query)
        const createButton = page.locator('text=Create Memory')
        const isCreateVisible = await createButton.isVisible().catch(() => false)
        
        if (!isCreateVisible) {
            console.log('ℹ️ Create Memory button not visible in current state, skipping test')
            return
        }
        
        // Test online behavior first
        console.log('🌐 Testing Create Memory button online...')
        const urlBeforeCreate = page.url()
        
        await createButton.click()
        await page.waitForTimeout(1000)
        
        const urlAfterCreate = page.url()
        const didNavigate = urlAfterCreate !== urlBeforeCreate
        console.log(`🔗 Create button navigation online: ${didNavigate}`)
        
        // Go back to main page
        if (didNavigate) {
            await page.goBack()
            await page.waitForTimeout(1000)
        }
        
        // Test offline behavior
        console.log('🔌 Testing Create Memory button offline...')
        await page.context().setOffline(true)
        await page.waitForTimeout(1000)
        
        // Button should be disabled
        const offlineCreateButton = page.locator('text=Create Memory')
        if (await offlineCreateButton.isVisible().catch(() => false)) {
            const isDisabled = await offlineCreateButton.isDisabled()
            expect(isDisabled).toBe(true)
            console.log('✅ Create Memory button is disabled offline')
            
            // Check styling
            const buttonClass = await offlineCreateButton.getAttribute('class') || ''
            expect(buttonClass).toContain('bg-gray-400')
            console.log('✅ Create Memory button has disabled styling')
        }
        
        // Cleanup
        await page.context().setOffline(false)
        
        console.log('✅ Create Memory button offline test completed!')
    })
})