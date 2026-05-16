Create a full-stack web application for an Agro Material Management System.

Core Concept:
This system manages transactions between Farmers (Shetkari) and Traders (Vyapari). Farmers supply raw materials on credit, and processed goods are sold to traders. The system tracks material flow, billing, and payments.

---

FEATURES REQUIRED:

1. Farmer (Material In Module)

* Add farmer details
* Record material received:

  * Product Name
  * Weight (in carret/kg)
  * Rate
  * Total Amount (auto calculated)
* Payment mode: Credit (default)
* Track pending payments for each farmer

2. Farmer Payment System

* Record payments (Debit entry when paid)
* Bill-wise payment tracking
* Generate A5 size receipt
* Receipt must include:

  * Farmer Name
  * Date
  * Product details
  * Paid Amount
  * Pending Amount
* Add WhatsApp sharing functionality for receipt

3. Trader (Material Out / Sales Module)

* Add trader details
* Create sales invoice:

  * Invoice Date
  * Bill Number (auto-generated)
  * Product Name
  * Unit (Carret)
  * Weight
  * Rate (variable per trader)
  * Total Amount (auto calculated)
* Footer must include:

  * Total Quantity
  * Received Amount
  * Previous Pending Payment
  * Notes/Discussion

4. Trader Payment Management

* Credit and Debit tracking
* Maintain separate statement for each trader
* Show payment history

5. Dashboard
   Display:

* Total Material In (Today)
* Total Sales (Today)
* Total Cash In
* Total Cash Out
* Total Pending Payments
* Summary cards + charts

6. Reports

* Daily report:

  * Total quantity received
  * Total amount received
* Filter by date

7. Cash Flow

* Cash In: Money received from traders
* Cash Out: Payments made to farmers

---

TECH STACK:

* Frontend: React.js (no Tailwind, use custom CSS)
* Backend: Node.js + Express
* Database: MongoDB

---

UI REQUIREMENTS:

* Clean admin dashboard UI
* Mobile responsive
* Sidebar navigation
* Forms for adding data
* Tables for viewing records

---

IMPORTANT:

* No stock/inventory management
* Focus only on transactions and payments
* Use same logo across the app
* Do NOT connect to any previous EMS or role-wise dashboard project
* Ensure proper data flow and API separation

---

DELIVERABLE:

* Fully working admin panel
* Clean UI
* Proper CRUD operations
* Working dashboard and reports
