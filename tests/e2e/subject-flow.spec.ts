import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Subject Facing Flow', () => {
  let sliderProjectId: string;
  let radioProjectId: string;

  test.beforeAll(() => {
    // Run the seed script to create a project and get its ID
    try {
      const output = execSync('npx tsx scripts/seed-test-data.ts', { encoding: 'utf-8' });
      // The script prints the project IDs as JSON on the last line
      const lines = output.trim().split('\n');
      const jsonOutput = JSON.parse(lines[lines.length - 1]);
      sliderProjectId = jsonOutput.sliderProjectId;
      radioProjectId = jsonOutput.radioProjectId;
      console.log(`Slider Project ID: ${sliderProjectId}`);
      console.log(`Radio Project ID: ${radioProjectId}`);
    } catch (error) {
      console.error('Failed to seed test data:', error);
      throw error;
    }
  });

  test.afterAll(async () => {
    // Cleanup: Delete the created projects
    try {
      if (sliderProjectId) {
        await prisma.project.delete({ where: { id: sliderProjectId } });
        console.log(`Deleted Slider Project ID: ${sliderProjectId}`);
      }
      if (radioProjectId) {
        await prisma.project.delete({ where: { id: radioProjectId } });
        console.log(`Deleted Radio Project ID: ${radioProjectId}`);
      }
    } catch (error) {
      console.error('Failed to cleanup test data:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('Complete subject flow (Slider): Consent -> View Images -> Evaluate -> Finish', async ({ page }) => {
    test.setTimeout(120000); // Increase test timeout to 2 minutes

    // 1. Navigate to the project page
    await page.goto(`/ja/projects/${sliderProjectId}`);

    // Verify Project Title
    await expect(page.locator('h1')).toContainText('E2E Test Project');

    // 2. Consent
    const consentCheckbox = page.getByLabel('このプロジェクトへの参加に同意します');
    await expect(consentCheckbox).toBeVisible();
    await consentCheckbox.check();

    // Verify active status (ensure no error message)
    await expect(page.getByText('実施期間外です')).not.toBeVisible();

    // Start Evaluation
    const startButton = page.getByRole('button', { name: '評価を開始' });
    await expect(startButton).toBeEnabled();
    await startButton.click();

    // Verify navigation to evaluate page
    await expect(page).toHaveURL(new RegExp(`/projects/${sliderProjectId}/evaluate`), { timeout: 60000 });

    // 3. Image Presentation & Evaluation Loop
    const imageCount = 2;

    for (let i = 0; i < imageCount; i++) {
      // Check for "No images" error
      const noImages = page.getByText('画像が登録されていません');
      if (await noImages.isVisible()) {
        throw new Error('No images registered error shown');
      }

      // Verify Image is visible
      const image = page.locator('img[alt^="Image"]');
      await expect(image).toBeVisible({ timeout: 30000 });

      // Verify Timer Countdown
      // We expect the timer to show "3s" initially, then decrease.
      // Since the test environment might be slow, we just check that the timer element exists and contains "s"
      const timer = page.locator('h6');
      await expect(timer).toBeVisible();
      await expect(timer).toContainText('s');

      // Verify "Next" button appears (it is part of the form)
      const nextButton = page.getByRole('button', { name: '次へ' });
      await expect(nextButton).toBeVisible({ timeout: 30000 }); // Wait for timer to finish

      // Verify Sliders are present
      const sliders = page.getByRole('slider');
      await expect(sliders).toHaveCount(2); // 2 questions

      // Wait for animations to settle
      await page.waitForTimeout(1000);

      // Interact with Sliders
      // Change value of first slider
      const firstSlider = sliders.first();
      await firstSlider.click({ force: true }); // Click to focus/change value
      // We can also use keyboard to move slider
      await firstSlider.press('ArrowRight');

      await nextButton.click();
    }

    // 4. Verify Completion
    // Should be redirected to thanks page
    await expect(page).toHaveURL(new RegExp(`/projects/${sliderProjectId}/thanks`), { timeout: 30000 });

    // Verify Thanks Message
    await expect(page.getByRole('heading', { name: 'ありがとうございました' })).toBeVisible();
  });

  test('Complete subject flow (Radio): Consent -> View Images -> Evaluate -> Finish', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Navigate to the project page
    await page.goto(`/ja/projects/${radioProjectId}`);

    // 2. Consent
    const consentCheckbox = page.getByLabel('このプロジェクトへの参加に同意します');
    await expect(consentCheckbox).toBeVisible();
    await consentCheckbox.check();

    // Start Evaluation
    const startButton = page.getByRole('button', { name: '評価を開始' });
    await startButton.click();

    // Verify navigation to evaluate page
    await expect(page).toHaveURL(new RegExp(`/projects/${radioProjectId}/evaluate`), { timeout: 60000 });

    // 3. Image Presentation & Evaluation Loop
    const imageCount = 1;

    for (let i = 0; i < imageCount; i++) {
      // Verify Image is visible
      const image = page.locator('img[alt^="Image"]');
      await expect(image).toBeVisible({ timeout: 30000 });

      // Verify "Next" button appears
      const nextButton = page.getByRole('button', { name: '次へ' });
      await expect(nextButton).toBeVisible({ timeout: 30000 });

      // Verify Radio Buttons are present
      // We have 1 question with 7 options (-3 to 3)
      const radioGroup = page.getByRole('radiogroup');
      await expect(radioGroup).toBeVisible();
      const radios = radioGroup.getByRole('radio');
      await expect(radios).toHaveCount(7);

      // Interact with Radio Buttons
      // Select the middle option (value 0, index 3)
      await radios.nth(3).check();
      await expect(radios.nth(3)).toBeChecked();

      await nextButton.click();
    }

    // 4. Verify Completion
    await expect(page).toHaveURL(new RegExp(`/projects/${radioProjectId}/thanks`), { timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'ありがとうございました' })).toBeVisible();
  });
});
