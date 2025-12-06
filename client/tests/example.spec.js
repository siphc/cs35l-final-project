import { test, expect } from '@playwright/test';

test.beforeAll(async ({ request }) => {
  await request.post('http://localhost:3001/api/test/reset-db');
});

test.afterAll(async ({ request }) => {
  await request.post('http://localhost:3001/api/test/reset-db');
});

test('Authentication', async ({ page }) => {
  // Snapshot upon init should be login
  await page.goto('http://localhost:5173/');
  await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - heading "Digital Classroom Platform" [level=1]
    - heading "User Login" [level=2]
    - text: "Email:"
    - textbox "Email:"
    - text: "Password:"
    - textbox "Password:"
    - button "Log In"
    - paragraph:
      - text: Don't have an account?
      - link "Register here":
        - /url: "#"
    `);
  
  // Failed login attempt
  await page.getByRole('textbox', { name: 'Email:' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).fill('example@gmail.com');
  await page.getByRole('textbox', { name: 'Email:' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password:' }).fill('12345678');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('#root')).toContainText('Login failed: Invalid email or password');

  // Failed register attempt
  await page.getByRole('link', { name: 'Register here' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).fill('example@gmail.com');
  await page.getByRole('textbox', { name: 'Email:' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password:' }).fill('12345678');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('#root')).toContainText('Password must be at least 8 characters and include upper, lower, digit, and special character.');

  // Successful register attempt
  await page.getByRole('textbox', { name: 'Password:' }).click();
  await page.getByRole('textbox', { name: 'Password:' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Password:' }).fill('Asdf_1234');
  await page.getByRole('button', { name: 'Register' }).click({timeout: 10000});

  // Redirect to login, successful login attempt
  await expect(page.locator('h2')).toContainText('User Login');
  await page.getByRole('textbox', { name: 'Email:' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).fill('example@gmail.com');
  await page.getByRole('textbox', { name: 'Email:' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password:' }).fill('Asdf_1234');
  await page.getByRole('button', { name: 'Log In' }).click({ timeout: 10000 });

  // Expect dashboard and sidebar
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - banner:
      - heading "Dashboard" [level=1]
    - heading "Quick Access" [level=2]
    - button "Go to Messaging Center"
    - button "Join Class"
    - button "Create Class"
    - heading "My Classes" [level=2]
    - paragraph: You haven't joined or created any classes yet. Use the buttons above to get started!
    `);
  await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - text: UCLA
    - navigation: 👤 Account 📊 Dashboard 📅 Calendar 💬 Messaging
    - text: 🚪 Logout
    `);
  
  await page.getByText('🚪 Logout').click();
});

test('UI Functionality', async ({ page }) => {
  // Log back in first
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'Email:' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).fill('example@gmail.com');
  await page.getByRole('textbox', { name: 'Email:' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password:' }).fill('Asdf_1234');
  await page.getByRole('button', { name: 'Log In' }).click({ timeout: 10000 });

  // Expect account page to display properly before & after name change
  await page.getByText('👤 Account').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - banner:
      - heading "User Account Settings" [level=1]
    - heading "Profile Details" [level=3]
    - paragraph:
      - strong: "Email:"
      - text: example@gmail.com
    - paragraph:
      - strong: "Display Name:"
      - text: Not set
    - paragraph:
      - strong: "Member Since:"
      - text: /\\d+\\/\\d+\\/\\d+/
    - heading "Edit Profile" [level=3]
    - button "Edit Display Name"
    `);
  await page.getByRole('button', { name: 'Edit Display Name' }).click();
  await page.getByRole('textbox', { name: 'Display Name:' }).click();
  await page.getByRole('textbox', { name: 'Display Name:' }).fill('Test Instructor');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.goto('http://localhost:5173/');
  await page.getByText('👤 Account').click({ timeout: 10000 });
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - banner:
      - heading "User Account Settings" [level=1]
    - heading "Profile Details" [level=3]
    - paragraph:
      - strong: "Email:"
      - text: example@gmail.com
    - paragraph:
      - strong: "Display Name:"
      - text: Test Instructor
    - paragraph:
      - strong: "Member Since:"
      - text: /\\d+\\/\\d+\\/\\d+/
    - heading "Edit Profile" [level=3]
    - button "Edit Display Name"
    `);

  // Class creation
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Create Class' }).click();
  await page.getByRole('textbox', { name: 'Class Name:' }).click();
  await page.getByRole('textbox', { name: 'Class Name:' }).fill('TC 35L - End-to-end Testing Frameworks');
  await page.getByRole('textbox', { name: 'Description:' }).click();
  await page.getByRole('textbox', { name: 'Description:' }).fill('This course teaches you about the magic of end to end testing :)');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - heading "Create a Class" [level=2]
    - paragraph: Class created successfully!
    - paragraph
    - paragraph: Share this code with students so they can join your class.
    - button "Done"
    `);
  await page.getByRole('button', { name: 'Done' }).click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "TC 35L - End-to-end Testing Frameworks" [level=3]
    - paragraph: This course teaches you about the magic of end to end testing :)
    - paragraph: "Role: Instructor"
    - paragraph
    `);
  await page.getByText('TC 35L - End-to-end Testing FrameworksThis course teaches you about the magic').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - banner:
      - heading "TC 35L - End-to-end Testing Frameworks" [level=1]
      - paragraph: This course teaches you about the magic of end to end testing :)
      - paragraph
    - text: Home Assignments Grades People Groups
    - heading "Assignments" [level=2]
    - button "Create Assignment"
    - paragraph: No assignments yet. Click "Create Assignment" to add one.
    `);
  
  // Assignment creation
  await page.getByRole('button', { name: 'Create Assignment' }).click();
  await page.getByRole('textbox', { name: 'Title:' }).click();
  await page.getByRole('textbox', { name: 'Title:' }).fill('Final Exam');
  await page.getByRole('textbox', { name: 'Description:' }).click();
  await page.getByRole('textbox', { name: 'Description:' }).fill('Make a end-to-end test with Playwright.');
  await page.getByRole('textbox', { name: 'Due Date:' }).click();
  await page.getByRole('textbox', { name: 'Due Date:' }).fill('2030-01-01T23:59');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "Assignments" [level=2]
    - button "Create Assignment"
    - table:
      - rowgroup:
        - row "Assignment Title Due Date Points Actions":
          - cell "Assignment Title"
          - cell "Due Date"
          - cell "Points"
          - cell "Actions"
      - rowgroup:
        - row /Final Exam Make a end-to-end test with Playwright\\. Jan 1, \\d+ \\d+ Delete/:
          - cell "Final Exam Make a end-to-end test with Playwright.":
            - strong: Final Exam
          - cell /Jan 1, \\d+/
          - cell /\\d+/
          - cell "Delete":
            - button "Delete"
    `);
  
  // Grades, People, Groups tab display properly
  await page.getByText('Grades').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "Grade Assignments" [level=2]
    - paragraph: "Select an assignment to grade:"
    - heading "Final Exam" [level=3]
    - paragraph: "/Due: 1\\\\/1\\\\/\\\\d+ \\\\| \\\\d+ points \\\\| 0 student\\\\(s\\\\) graded/"
    `);
  await page.getByText('People').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "Instructor" [level=2]
    - text: Instructor
    - paragraph: Test Instructor
    - paragraph: example@gmail.com
    - heading "Students (0)" [level=2]
    - paragraph: No students have joined this class yet.
    `);
  await page.getByText('Groups').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "Existing Chats" [level=2]
    - paragraph: No chats created yet.
    - heading "Create New Chat" [level=2]
    - button "Show Form"
    `);

  // Calendar functionality
  await page.getByText('📅 Calendar').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - banner:
      - heading "Calendar" [level=1]
      - button "+ Create Event"
    - heading /December \\d+/ [level=2]
    - button "Prev"
    - button "Next"
    - text: /Sun Mon Tue Wed Thu Fri Sat 1 2 3 4 5 6 7 8 9 \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+ \\d+/
    `);

  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('h2')).toContainText('January 2026');
  await page.getByRole('button', { name: 'Prev' }).click();
  await page.getByRole('button', { name: '+ Create Event' }).click();
  await page.locator('input[type="date"]').fill('2025-12-25');
  await page.locator('input[type="time"]').click();
  await page.locator('input[type="time"]').fill('08:00');
  await page.getByRole('textbox', { name: 'Enter event title' }).click();
  await page.getByRole('textbox', { name: 'Enter event title' }).fill('Christmas!');
  await page.locator('.color-picker > div:nth-child(3)').click();
  await page.getByRole('button', { name: 'Create Event', exact: true }).click();

  await page.getByRole('button', { name: '+ Create Event' }).click();
  await page.locator('input[type="date"]').fill('2025-12-24');
  await page.locator('input[type="date"]').press('Tab');
  await page.locator('input[type="time"]').click();
  await page.locator('input[type="time"]').fill('22:00');
  await page.getByRole('textbox', { name: 'Enter event title' }).click();
  await page.getByRole('textbox', { name: 'Enter event title' }).fill('Christmas Eve!');
  await page.locator('.color-picker > div:nth-child(2)').click();
  await page.getByRole('button', { name: 'Create Event', exact: true }).click();

  await expect(page.getByText('Christmas Eve!')).toBeVisible();
  await expect(page.getByText('Christmas!')).toBeVisible();

  // Messaging functionality
  await page.getByText('💬 Messaging').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - banner:
      - heading "Messaging Center" [level=1]
    - paragraph: You don't have any chats yet.
    - paragraph: Go to a class and navigate to the Groups tab to create a chat.
    `);
  await page.getByText('📊 Dashboard').click();
  await page.getByText('TC 35L - End-to-end Testing FrameworksThis course teaches you about the magic').click();
  await page.getByText('Groups').click();
  await page.getByRole('button', { name: 'Show Form' }).click();
  await page.getByRole('checkbox', { name: 'Test Instructor Instructor' }).check();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Create New Chat (1 selected)' }).click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "Existing Chats" [level=2]
    - strong: Test Instructor
    - text: 1 participant
    - button "View Chat"
    - button "Delete"
    `);
  await page.getByText('💬 Messaging').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`
    - heading "Your Chats" [level=3]
    - text: Test Instructor TC 35L - End-to-end Testing Frameworks • 1 members Select a chat to start messaging
    `);
  await page.getByText('Test InstructorTC 35L - End-').click();
  await page.getByRole('textbox', { name: 'Type a message...' }).click();
  await page.getByRole('textbox', { name: 'Type a message...' }).fill('Hi!');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`- text: Test Instructor Hi! Just now`);
  await page.goto('http://localhost:5173/');
  await page.getByText('💬 Messaging').click();
  await page.getByText('Test InstructorTC 35L - End-').click();
  await expect(page.locator('#main-content-wrapper')).toMatchAriaSnapshot(`- text: Test Instructor Hi! Just now`);

  await page.getByText('🚪 Logout').click();
});