import { test, expect } from '@playwright/test';

test.describe('MedSafe Frontend Review Agent', () => {
  test('should navigate through the session and preserve state on back', async ({ page }) => {
    // Increase test timeout for slower dev server compilation
    test.setTimeout(60000);

    // 1. New Session Form
    await page.goto('/new-session');
    
    // Fill out Patient Details
    await page.fill('input#patient-name', 'Test Patient Agent');
    await page.fill('input#patient-id', 'S1234567A');
    await page.selectOption('select#ward', 'ICU');
    await page.fill('input#bed-number', '1A');
    await page.click('text=None known'); // Select no allergies

    // Start Session
    await page.click('button:has-text("Start Session")');
    await expect(page).toHaveURL(/\/home-meds/, { timeout: 15000 });

    // 2. Home Meds Step
    // Add a manual medication
    await page.click('text=Manual Entry');
    await page.fill('input[placeholder="e.g. Metformin"]', 'Aspirin');
    await page.fill('input[placeholder="e.g. 500 mg"]', '100mg');
    await page.fill('input[placeholder="e.g. 1 tablet"]', '1 tablet');
    await page.fill('input[placeholder="e.g. Twice daily"]', 'once daily');
    await page.click('button:has-text("Add Medication")');

    // Verify it was added
    await expect(page.locator('text=Aspirin').first()).toBeVisible();

    // Go to Discharge Meds
    await page.click('button:has-text("Next")');
    await expect(page).toHaveURL(/\/discharge-meds/, { timeout: 10000 });

    // 3. Discharge Meds Step
    await page.click('button:has-text("Add medication")');
    await page.fill('input[placeholder="Drug name"]', 'Lisinopril');
    await page.fill('input[placeholder="Strength (e.g. 40mg)"]', '10mg');
    await page.fill('input[placeholder="Dose (e.g. 1 tablet)"]', '1 tablet');
    await page.fill('input[placeholder="Frequency"]', 'twice daily');

    // Verify it was added
    await expect(page.locator('input[placeholder="Drug name"]')).toHaveValue('Lisinopril');

    // 4. Test state preservation by going BACK
    await page.click('button:has-text("Back")');
    await expect(page).toHaveURL(/\/home-meds/, { timeout: 10000 });

    // Ensure Aspirin is still there!
    await expect(page.locator('text=Aspirin').first()).toBeVisible();

    // Test going BACK to New Session
    await page.click('button:has-text("Back")');
    await expect(page).toHaveURL(/\/new-session/, { timeout: 10000 });

    // Ensure Patient Name is still "Test Patient Agent"
    await expect(page.locator('input#patient-name')).toHaveValue('Test Patient Agent');

    // 5. Navigate forward again
    await page.click('button:has-text("Start Session")');
    await expect(page).toHaveURL(/\/home-meds/, { timeout: 15000 });
    await page.click('button:has-text("Next")');
    await expect(page).toHaveURL(/\/discharge-meds/, { timeout: 10000 });

    // Ensure Lisinopril is still there
    await expect(page.locator('input[placeholder="Drug name"]').first()).toHaveValue('Lisinopril');

    // Go to Review
    await page.click('button:has-text("Next: Review")');
    await expect(page).toHaveURL(/\/medication-review/, { timeout: 10000 });

    // Let the review page load
    await expect(page.locator('text=Test Patient Agent').first()).toBeVisible({ timeout: 10000 });
  });
});
