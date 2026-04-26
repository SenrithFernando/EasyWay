import { test, expect } from '@playwright/test';

// Mock user data for authentication
const mockUser = {
  id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'student'
};

test.describe('Table Reservation System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the table reservation page
    await page.goto('/table');

    // Mock localStorage to simulate a logged-in user
    await page.evaluate((user) => {
      localStorage.setItem('token', 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify(user));
    }, mockUser);

    // Reload to ensure state picks up localStorage
    await page.reload();

    // Mock the reservations API to return empty initially (no tables reserved)
    await page.route('**/api/reservations', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else if (route.request().method() === 'POST') {
        // Mock successful reservation creation
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Reservation successful',
            reservationCode: 'MOCK-PIN-1234',
          }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test('Student can open the table reservation page and see available tables', async ({ page }) => {
    // Check page title
    await expect(page.locator('text=Reserve a Table')).toBeVisible();

    // Verify Date section exists
    await expect(page.locator('text=Select Date & Time')).toBeVisible();

    // Wait for the specific tomorrow date button
    const timeSlots = page.locator('[data-testid^="time-slot-"]');
    await expect(timeSlots.first()).toBeVisible();
  });

  test('Student can filter/select table location such as Study Area or Canteen', async ({ page }) => {
    // Select "Study Area Main"
    const studyAreaBtn = page.getByTestId('area-option-study-area');
    await expect(studyAreaBtn).toBeVisible();
    await studyAreaBtn.click();

    // Verify that the UI reflects the active selection (via class name change)
    await expect(studyAreaBtn).toHaveClass(/bg-surface-900/);

    // Verify that specific tables for the study area appear
    await expect(page.getByTestId('table-slot-9')).toBeVisible();
    await expect(page.getByTestId('table-slot-10')).toBeVisible();
  });

  test('Required field validation should appear when reservation data is missing', async ({ page }) => {
    const confirmBtn = page.getByTestId('confirm-reservation-btn');
    
    // Without selecting time or table, the button should be disabled
    await expect(confirmBtn).toBeDisabled();

    // Select time
    const availableTime = page.locator('[data-testid^="time-slot-"]:not([disabled])').first();
    await availableTime.click();

    // Still disabled because no table is selected
    await expect(confirmBtn).toBeDisabled();

    // Select table
    const availableTable = page.locator('[data-testid^="table-slot-"]:not([disabled])').first();
    await availableTable.click();

    // Now it should be enabled
    await expect(confirmBtn).toBeEnabled();
  });

  test('Student can reserve an available table', async ({ page }) => {
    // Step 1: Select tomorrow date to ensure times are available
    const dateOptions = page.locator('[data-testid^="date-option-"]');
    await dateOptions.nth(1).click();

    // Step 2: Select a time
    const availableTime = page.locator('[data-testid^="time-slot-"]:not([disabled])').first();
    await availableTime.click();

    // Step 3: Select an area
    await page.getByTestId('area-option-study-area').click();

    // Step 4: Select an available table
    const availableTable = page.locator('[data-testid^="table-slot-"]:not([disabled])').first();
    await availableTable.click();

    // Step 5: Confirm reservation
    const confirmBtn = page.getByTestId('confirm-reservation-btn');
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Step 6: Verify success state
    const successBanner = page.getByTestId('reservation-success');
    await expect(successBanner).toBeVisible();
    await expect(page.locator('text=Reservation Confirmed!')).toBeVisible();
    await expect(page.locator('text=MOCK-PIN-1234')).toBeVisible();
  });

  test('Student cannot reserve an already reserved table', async ({ page }) => {
    // Mock the API to simulate a fully reserved table (Table 1 has 2 seats, we mock 2 seats reserved)
    await page.route('**/api/reservations', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: 'res1',
              date: await page.locator('[data-testid^="date-option-"]').first().innerText(),
              time: '1:00 PM', // Assuming this is an available slot
              location: 'Main Dining Area',
              tableId: 1,
              seats: 2,
              status: 'Confirmed'
            }
          ]),
        });
      } else {
        await route.continue();
      }
    });

    await page.reload();

    // Select time that matches the reservation
    await page.getByTestId('time-slot-1:00-pm').click();

    // Verify Table 1 is disabled because it is fully occupied
    const table1 = page.getByTestId('table-slot-1');
    await expect(table1).toBeDisabled();
    
    // Verify it shows "Full"
    await expect(table1.locator('text=Full')).toBeVisible();
  });

  test('Empty state when no tables are available', async ({ page }) => {
    // Select 4 seats
    await page.getByTestId('seat-option-4').click();

    // If we select a table that has less than 4 seats, it should be disabled
    // Table 1 only has 2 seats total
    const table1 = page.getByTestId('table-slot-1');
    
    // We must select a time first to see the table disabled state clearly
    const availableTime = page.locator('[data-testid^="time-slot-"]:not([disabled])').first();
    await availableTime.click();

    await expect(table1).toBeDisabled();
  });
});
