import { Page, Locator } from '@playwright/test'

export class SearchPage {
    readonly page: Page
    readonly searchInput: Locator
    readonly partialUserEmail: Locator
    readonly fullUserEmail: Locator
    readonly signOutButton: Locator
    readonly welcomeText: Locator

    constructor(page: Page) {
        this.page = page
        this.searchInput = page.locator('[placeholder*="Search"]')
        this.partialUserEmail = page.locator('text=test@')
        this.fullUserEmail = page.locator('text=test@instamem.local')
        this.signOutButton = page.locator('text=Sign out')
        this.welcomeText = page.locator('text=Welcome to InstaMem')
    }

    async goto() {
        await this.page.goto('/')
    }

    async search(query: string) {
        await this.searchInput.click()
        await this.searchInput.fill(query)
        await this.searchInput.press('Enter')
    }

    async clearSearch() {
        await this.searchInput.clear()
    }

    async isSearchInterfaceVisible() {
        return await this.searchInput.isVisible()
    }

    async isUserAuthenticated() {
        const hasPartialEmail = await this.partialUserEmail.isVisible().catch(() => false)
        if (hasPartialEmail) {
            // Open menu to check for sign out
            await this.partialUserEmail.click()
            const hasSignOut = await this.signOutButton.isVisible().catch(() => false)
            if (hasSignOut) {
                // Close menu
                await this.page.keyboard.press('Escape')
            }
            return hasSignOut
        }
        return false
    }

    async takeScreenshot(name: string) {
        const screenshot = await this.page.screenshot({ fullPage: true })
        await this.page.locator('body').first().screenshot() // Ensure page is loaded
        return this.page.evaluate(async (screenshotData) => {
            // This is a bit of a hack to attach to test info from page object
            // In real implementation, you'd pass test.info() from the test
        })
    }
}