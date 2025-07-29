import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly googleSignInButton: Locator
  readonly githubSignInButton: Locator
  readonly errorMessage: Locator
  readonly loadingSpinner: Locator
  readonly welcomeTitle: Locator

  constructor(page: Page) {
    this.page = page
    this.googleSignInButton = page.getByRole('button', { name: /continue with google/i })
    this.githubSignInButton = page.getByRole('button', { name: /continue with github/i })
    this.errorMessage = page.locator('[class*="bg-red-50"]')
    this.loadingSpinner = page.locator('.animate-spin')
    this.welcomeTitle = page.getByText('Welcome to InstaMem')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async clickGoogleSignIn() {
    await this.googleSignInButton.click()
  }

  async clickGitHubSignIn() {
    await this.githubSignInButton.click()
  }

  async waitForLoad() {
    await expect(this.welcomeTitle).toBeVisible()
    await expect(this.loadingSpinner).not.toBeVisible()
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible()
    await expect(this.errorMessage).toContainText(message)
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible()
  }
}