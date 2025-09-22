Here’s a **Phase 1 Implementation Plan** broken into milestones, tasks, and priorities for the four features you listed:

---

## **Phase 1: Core Features Implementation**

### 1. **Authentication (Clerk)**

**Goal:** Enable signin/signup with role assignment (Nutritionist).
**Tasks:**

* [ ] Integrate Clerk into Next.js app (App Router, middleware, ClerkProvider).
* [ ] Configure roles in Clerk JWT claims (`nutritionist`, `end-user`).
* [ ] Add a simple role-based route guard (Nutritionist dashboard vs. user form).
* [ ] Seed initial Nutritionist role for testing.

**Deliverable:** User can sign up, sign in, and land on different dashboards based on role.

---

### 2. **Schema definition for a sheet (Nutrition Plan)**

**Goal:** Define schema metadata for Nutrition Plan sheet and connect app to that sheet.
**Tasks:**

* [ ] Build connector service interface (abstract) + Google Sheets implementation (read/write headers + rows).
* [ ] Implement schema metadata storage in MongoDB:

  * Fields: label, type, required, mapping → sheet column.
* [ ] Build schema editor UI (Nutritionist-facing):

  * For MVP, allow Nutritionist to import header row from sheet.
  * Basic editing: rename, mark required, set type (string/number/date).
* [ ] Persist schema in MongoDB and associate it with the sheet.

**Deliverable:** Nutritionist can connect Google Sheet (Nutrition Plan), view imported schema, make simple edits, and save schema in MongoDB.

---

### 3. **User-facing form (mapped to schema)**

**Goal:** End-user fills form that writes back to Nutrition Plan sheet.
**Tasks:**

* [ ] Render form dynamically from schema metadata.
* [ ] Add validation rules (required fields, type checks).
* [ ] On submit:

  * Transform inputs → sheet row format.
  * Call connector service to append row to Google Sheet.
* [ ] Confirmation screen after submission.

**Deliverable:** End-user logs in, fills Nutrition Plan form, and sees their submission stored in Google Sheet.

---

### 4. **PDF generation (client-side)**

**Goal:** Allow user to download PDF of their submitted data.
**Tasks:**

* [ ] Define a simple Nutrition Plan PDF template (HTML/CSS).
* [ ] Use a client-side PDF library (e.g., **html2pdf.js** or **jspdf + html2canvas**).
* [ ] Map submitted form data → template placeholders.
* [ ] Generate and download PDF directly on client.

**Deliverable:** After form submission, user can download a PDF with their data in the Nutrition Plan template.

---

## **Phase 1 Timeline (Suggested 3 weeks)**

**Week 1**

* Set up project (Next.js, shadcn, Clerk, MongoDB connection with Prisma).
* Implement authentication with role-based access.

**Week 2**

* Build Google Sheets connector (read headers, append row).
* Implement schema import + basic editor (Nutritionist dashboard).
* Persist schema in MongoDB.

**Week 3**

* Build user-facing dynamic form from schema.
* Implement form submission → append row in sheet.
* Add client-side PDF generation from form data.
* Polish flows: Nutritionist defines schema → User fills form → User downloads PDF.

---

✅ **End of Phase 1 Outcome:**

* Nutritionist logs in → connects sheet + defines schema.
* End-user logs in → sees form → submits → data goes into sheet.
* End-user downloads PDF of their submission.

---

Would you like me to also **write a sequence diagram** showing the flow (Nutritionist defines schema → User submits form → PDF generated) so your dev team has a visual reference?
