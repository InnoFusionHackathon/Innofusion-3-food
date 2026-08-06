# Gastronomy Flow

Build a modern, premium, responsive web application called "Smart Food QR Management System" for managing food distribution during a hackathon.

The frontend should be production-ready and connected using placeholder REST APIs so I can later connect it to my Flask + MongoDB backend.

Theme:

Modern

Minimal

Glassmorphism

Professional

Dark mode with vibrant gradients

Use smooth animations

Rounded cards

Beautiful icons

Responsive for desktop, tablet and mobile

Use:

React

TypeScript

Tailwind CSS

Shadcn UI

Lucide Icons

Framer Motion

React Router

==================================================

APPLICATION STRUCTURE

==================================================

Create these pages:

1.

Login

2.

Admin Dashboard

3.

Participants Management

4.

Generate Organiser Codes

5.

Scan Logs

6.

Reports

7.

Organiser Login

8.

QR Scanner

9.

404 Page

==================================================

LOGIN PAGE

==================================================

Beautiful centered login card.

Two login buttons

Admin Login

Organiser Login

Use email/password fields for Admin.

For organiser don't ask email.

Just ask

Organiser Code

Large beautiful button

Continue

Backend APIs will validate.

==================================================

ADMIN DASHBOARD

==================================================

Premium dashboard.

Left Sidebar

Dashboard

Participants

Organiser Codes

Scan Logs

Reports

Logout

Top Navbar

Current Date

Current Time

Admin Name

Notification Icon

Profile

Dashboard Cards

Total Participants

Breakfast Claimed

Lunch Claimed

Dinner Claimed

Today's Total Scans

Duplicate Attempts

Active Organisers

Pending Meals

Use animated counters.

Show circular progress for every meal.

Charts

Meal Distribution

Pie Chart

Hourly Scan Activity

Bar Chart

Meal Trend

Line Chart

Recent Activity Card

Latest successful scans

Latest duplicate attempts

Live Activity Panel

Should refresh automatically.

==================================================

PARTICIPANTS PAGE

==================================================

Header

Participants Management

Buttons

Import Excel

Export CSV

Generate QR

Search Bar

Filters

College

Team

Meal Status

Table

Photo

Participant Name

Registration ID

QR ID

College

Team

Breakfast

Lunch

Dinner

Actions

View

Edit

Delete

Status badges

Green

Collected

Red

Pending

Clicking View opens beautiful modal.

Modal contains

Photo

Name

Phone

Email

College

Team

QR Preview

Meal History

==================================================

ORGANISER CODE PAGE

==================================================

Header

Organiser Management

Card

Create New Code

Fields

Organiser Name

Expiry Duration

Dropdown

1 Hour

2 Hours

5 Hours

12 Hours

24 Hours

Generate Button

Generated code appears inside beautiful card.

Copy Button

Share Button

Table

Code

Organiser

Created Time

Expiry

Status

Actions

Deactivate

Delete

==================================================

SCAN LOG PAGE

==================================================

Beautiful table.

Columns

Time

Participant

Meal

Organiser

Status

Device

Search

Date Filter

Meal Filter

Status Filter

Status colors

Green

Success

Red

Duplicate

Orange

Invalid

==================================================

REPORTS PAGE

==================================================

Statistics cards.

Download buttons

CSV

Excel

PDF

Charts

Meal wise

College wise

Hourly

Daily

==================================================

ORGANISER LOGIN

==================================================

Simple page.

Centered card.

Title

Food Distribution Scanner

Field

Organiser Code

Button

Validate Code

If API success

Navigate to scanner.

==================================================

QR SCANNER PAGE

==================================================

This is the most important page.

Very clean.

Large camera section.

Camera occupies most of screen.

Top card

Current Organiser

Current Time

Connection Status

Meal Selector

Breakfast

Lunch

Dinner

Large segmented control.

Scanner starts only after selecting meal.

Below scanner show

Last Scan

Participant Card

Photo

Name

Registration ID

College

Team

Current Meal

Scan Time

==================================================

SUCCESS SCREEN

==================================================

Green animation.

Large check icon.

Display

Meal Successfully Issued

Participant Name

Registration ID

Meal

Time

Automatically return to scanner after 2 seconds.

Play success sound.

==================================================

DUPLICATE SCREEN

==================================================

Red animation.

Already Collected

Show

Participant Name

Collected Time

Meal

Collected By

Return automatically.

Play error sound.

==================================================

INVALID QR

==================================================

Orange warning.

Participant Not Found

==================================================

LOADING STATE

==================================================

Beautiful loader while verifying QR.

==================================================

SETTINGS

==================================================

Dark Mode

Light Mode

Theme switch

==================================================

COMPONENTS

==================================================

Reusable components

Dashboard Card

Stat Card

Animated Counter

Participant Table

Charts

Modal

Scanner Card

Status Badge

Search Box

Loading Skeleton

Toast Notification

Confirmation Dialog

==================================================

API STRUCTURE

==================================================

Do NOT implement backend.

Instead create API service files with placeholder endpoints.

Example

POST /api/admin/login

POST /api/organiser/validate

GET /api/dashboard

GET /api/participants

POST /api/participants/import

POST /api/qr/generate

POST /api/scan

GET /api/scans

GET /api/reports

POST /api/organiser/create-code

GET /api/organiser/codes

DELETE /api/organiser/code/:id

Everything should use Axios.

Keep all APIs inside a services folder.

==================================================

UI QUALITY

==================================================

Make the UI look comparable to modern SaaS products.

Use glassmorphism.

Smooth hover animations.

Beautiful shadows.

Rounded corners.

Professional spacing.

Large typography.

Responsive layout.

Loading skeletons.

Toast notifications.

Empty states.

Error states.

Animated page transitions.

==================================================

IMPORTANT

==================================================

Do not use dummy backend logic.

Use placeholder API calls only.

Organize the project professionally.

Use reusable components.

Write clean code.

Follow best folder structure.

Everything should be ready so I only need to replace the API URLs with my Flask backend.

The final UI should look polished enough to be demonstrated at a national-level hackathon.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/803809de-439c-4a4d-8636-7fdfa2a37236).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
