Namkhana Substation System Reports— v1.0
------------------------------------------------------
Version - v1.0

📘 README — Namkhana Substation Web System

🏢 Project Overview

The Namkhana Substation Web System is a modern, secure, and fully responsive reporting and management interface for daily, monthly, and yearly substation data operations.
It streamlines report handling, analytics, and operator management with a clean, glassmorphic UI and real-time local data storage.


---

⚡ Core Modules

1. Monthly System Reports

Record and monitor monthly interruptions, secure meter readings, peak loads, and voltage variations.

Built-in data validation and auto-calculation for accuracy.

Exports available in PDF, XLSX, DOC, and combined formats.



2. Yearly System Reports

Automatically summarizes monthly data into yearly performance metrics.

Interruption, Secure Meter, Peak Load, and Max–Min Voltage sections calculated dynamically.

Integrated export system for complete yearly documentation.



3. Feeders Analytics (Admin Only)

Provides graphical load variation and detailed analysis per feeder.

Summarized yearly and monthly visual charts with responsive graph scaling.

Fully restricted and hidden for operator users.



4. Admin Dashboard

Manage operators, roles, and session details in a modern glassmorphic interface.

Search and filter operators (All / Active / Disabled).

Fully mobile-first layout — adaptive cards on small screens.

Includes yearly and feeder load visual graphs with summary overview.



5. Equipment Register

Maintain detailed records of installed and operational equipment.

Allows export in multiple formats (PDF, XLSX, DOC, or combined “Save All”).

Smart local draft saving and responsive display.





---

👥 User Roles

Admin

Full access to all reports, analytics, and management tools.

Can view, edit, and export all data.

Has exclusive access to Feeders Analytics and Admin Dashboard.


Operator

Access to Monthly, Yearly, and Equipment modules only.

Cannot access Feeders Analytics or admin control panels.

Able to edit data within assigned sections with restricted permissions.




---

🧠 Smart Features

Auto Sync & Calculation
All yearly reports update automatically as monthly data changes.

FastInit Engine
Optimized to reduce initial load times and ensure smooth tab transitions.

SafeMode Role Guard
Prevents accidental admin tool visibility for operators or during reloads.

Offline Data Support
LocalStorage-based saving ensures work continues even without internet.

Footer & Header System
Persistent, responsive design with organization logo and branding.

Theme Compatibility
Supports light and dark themes with auto-switch and saved preference memory.



---

📂 File Structure

Namkhana_Substation_System/
│
├── index.html                  → Main application file
├── /assets/                    → Logos, icons, and theme resources
├── /scripts/                   → Functional JS modules
├── /styles/                    → CSS for layout and glassmorphic UI
└── README.txt                  → Project documentation


---

💾 Data Export Options

PDF: Professionally formatted landscape reports for printing/sharing.

XLSX: Excel-based structured data export (multi-sheet available).

DOC: Formatted Word reports for official documentation.

Save All: Combined export for all tabs with auto-generated timestamps.



---

🔐 Security & Permissions

Role-based access enforced for all modules.

Admin-only controls fully hidden for Operators.

Session-based local login system with live sync between modules.

Safe fallback mode for corrupted or missing session data.



---

📱 Compatibility

Works across modern browsers (Chrome, Edge, Firefox).

Fully mobile-responsive interface.

Optimized for both desktop monitors and tablet
Open index.html in any browser to run the app.
