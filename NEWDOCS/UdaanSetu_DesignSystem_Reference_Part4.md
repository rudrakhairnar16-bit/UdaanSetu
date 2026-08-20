# UdaanSetu: Design System Quick Reference & Component Library (Part 4)

**Version:** 2.0 | **Date:** August 19, 2026 | **Audience:** Designers & Developers | **Status:** Implementation-Ready

---

## QUICK REFERENCE: DESIGN TOKENS

### Colors

```
Primary Green (Trust, Growth, Action):
  --green-50:   #f0fdf4    (Lightest backgrounds)
  --green-100:  #dcfce7    (Badge & hover backgrounds)
  --green-200:  #bbf7d0    (Secondary hover states)
  --green-500:  #22c55e    (Interactive elements)
  --green-600:  #16a34a    (Primary buttons DEFAULT)
  --green-700:  #15803d    (Primary buttons HOVER)
  --green-900:  #14532d    (High-contrast text)

Neutrals (Backgrounds, Borders, Text):
  --gray-50:    #f9fafb    (Page backgrounds)
  --gray-100:   #f3f4f6    (Card backgrounds)
  --gray-200:   #e5e7eb    (Borders, dividers)
  --gray-400:   #9ca3af    (Disabled text)
  --gray-600:   #4b5563    (Secondary text)
  --gray-900:   #111827    (Primary text)

Semantic Colors:
  --red-500:    #ef4444    (Errors, danger)
  --red-600:    #dc2626    (Danger HOVER)
  --yellow-500: #eab308    (Warnings, demo badge)
  --blue-500:   #3b82f6    (Info, secondary, focus outlines)
  --blue-600:   #2563eb    (Blue HOVER)
```

### Spacing (8px Grid)

```
--spacing-0:   0px
--spacing-1:   4px      (Icon to text)
--spacing-2:   8px      (Related items)
--spacing-3:   12px     (Form input margins)
--spacing-4:   16px     (Card padding, standard)
--spacing-5:   20px     (Comfortable spacing)
--spacing-6:   24px     (Generous padding, section breaks)
--spacing-8:   32px     (Large gaps)
--spacing-10:  40px     (Extra large)
--spacing-12:  48px     (Huge, hero section)
```

### Border Radius

```
--radius-none:  0px       (No rounding)
--radius-sm:    4px       (Badges, small components)
--radius-md:    8px       (Cards, buttons, inputs)
--radius-lg:    12px      (Modals, larger cards)
--radius-full:  9999px    (Pills, badges)
```

### Shadows

```
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.1)        (Default for cards)
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1)        (Hover, lifted elements)
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1)      (Prominent cards)
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1)      (Modals, dropdowns)
```

### Typography

```
Font Family:
  --font-body:   "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
  --font-mono:   "Fira Code", monospace

Type Scale:
  H1:   32px, weight 800, line-height 1.2   (Page titles)
  H2:   24px, weight 700, line-height 1.25  (Section titles)
  H3:   18px, weight 700, line-height 1.4   (Card titles)
  Body: 14px, weight 400, line-height 1.6   (Main text)
  Sm:   12px, weight 500, line-height 1.6   (Labels, metadata)
  Tiny: 11px, weight 600, line-height 1.4   (Badges, captions)
```

### Transitions

```
--transition-fast:   all 0.15s ease   (Hover, focus)
--transition-base:   all 0.2s ease    (State changes)
--transition-slow:   all 0.3s ease    (Large movements)
```

---

## QUICK REFERENCE: COMPONENT LIBRARY

### Button Component

```jsx
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary" size="md">Cancel</Button>
<Button variant="danger" size="md">Delete</Button>
<Button variant="ghost" size="sm">Skip</Button>
<Button disabled>Unavailable</Button>
<Button isLoading>Saving...</Button>
```

**Variants:** primary, secondary, danger, ghost, disabled
**Sizes:** sm (32px), md (40px), lg (48px)
**States:** default, hover, active, disabled, loading

---

### Input Component

```jsx
<Input 
  type="text"
  label="Full Name"
  placeholder="John Doe"
  required
  error={hasError ? "Name is required" : undefined}
/>

<Input
  type="email"
  label="Email Address"
  error={hasError ? "Invalid email format" : undefined}
/>

<Input
  type="password"
  label="Password"
  showToggle  /* Show/hide password icon */
/>

<Textarea
  label="Description"
  placeholder="Enter description..."
  maxLength={2000}
  showCounter  /* Show character count */
/>
```

**Input Types:** text, email, password, number, date, search, textarea
**Validation:** Real-time (on blur), on submit, after submit
**Required Indicator:** Asterisk (*) in label

---

### Badge Component

```jsx
<Badge variant="primary">Verified ✓</Badge>
<Badge variant="secondary">Draft</Badge>
<Badge variant="warning">Demo Data</Badge>
<Badge variant="danger">At Risk</Badge>
<Badge variant="info">New</Badge>

/* With icon and removal */
<Badge variant="danger" icon="alert" removable onRemove={() => {}}>
  High Risk
</Badge>
```

**Variants:** primary, secondary, warning, danger, info
**Styling:** Pill-shaped (--radius-full), flat (no shadow), compact padding

---

### Card Component

```jsx
<Card>
  <Card.Header>
    <h3>Project Title</h3>
    <Badge variant="success">Active</Badge>
  </Card.Header>
  <Card.Content>
    <p>Project description and details...</p>
  </Card.Content>
  <Card.Footer>
    <Button variant="primary">View Details</Button>
  </Card.Footer>
</Card>
```

**Structure:** Header (optional), Content (required), Footer (optional)
**Styling:** White bg, --radius-md, --shadow-sm, hover: --shadow-md + lift

---

### Modal Component

```jsx
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Create Research Project"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Create</Button>
    </>
  }
>
  {/* Form content */}
</Modal>
```

**Features:** Focus trap, Escape to close, backdrop, center-aligned
**Sizes:** sm (400px), md (600px), lg (800px)

---

### Toast Notification

```jsx
<Toast type="success" message="Record created successfully" />
<Toast type="error" message="Failed to save record" />
<Toast type="info" message="Record updated" />
<Toast type="warning" message="Going offline" />
```

**Types:** success, error, info, warning
**Duration:** 4-6 seconds (auto-dismiss)
**Position:** Bottom-right (full-width on mobile)

---

### Table Component

```jsx
<Table 
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'district', label: 'District' },
    { key: 'stage', label: 'Stage', sortable: true },
    { key: 'action', label: 'Action', width: '100px' }
  ]}
  data={records}
  striped
  hoverable
  pagination={{ page, pageSize, total }}
  onSort={(column) => setSort(column)}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

**Features:** Sortable columns, striped rows, hover highlight, pagination, checkboxes
**Mobile:** Horizontal scroll or convert to cards

---

### Pagination Component

```jsx
<Pagination 
  current={page}
  total={totalPages}
  onChange={(newPage) => setPage(newPage)}
/>
```

**Display:** [ ◄ ] [ 1 2 3 ... 10 ] [ ► ]
**Mobile:** Show only current page + arrows

---

### Select/Dropdown Component

```jsx
<Select
  label="Sector"
  options={[
    { value: 'agri', label: 'Agriculture' },
    { value: 'health', label: 'Healthcare' }
  ]}
  value={selected}
  onChange={(val) => setSelected(val)}
  searchable  /* For > 7 items */
  placeholder="Select sector..."
/>
```

**Variants:** Native select (< 7 items), searchable (7-20 items), combobox (20+ items)

---

### Breadcrumb Component

```jsx
<Breadcrumb 
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Research', href: '/research' },
    { label: 'Project Name', active: true }
  ]}
/>
```

**Display:** Dashboard > Research > Project Name
**Current Page:** Not clickable, bold/active styling

---

### LoadingSpinner

```jsx
{/* Indeterminate (unknown duration) */}
<LoadingSpinner size="lg" />

{/* Content loading (known duration) */}
<SkeletonCards count={3} />

{/* Progress bar (known duration) */}
<ProgressBar progress={60} />

{/* Inside button */}
<Button isLoading>Saving...</Button>
```

---

## QUICK REFERENCE: LAYOUT PATTERNS

### Dashboard Layout

```
┌──────────────────────────────────────────────────┐
│ Good Morning, [User]! │ Search │ [Notifications]│
├──────────────────────────────────────────────────┤
│ Greeting & Date                                  │
├──────────────────────────────────────────────────┤
│ Pipeline Overview Visualization                  │
├──────────────────────────────────────────────────┤
│ Stats Grid (1-4 columns depending on screen)     │
├──────────────────────────────────────────────────┤
│ At-Risk Projects Table                           │
├──────────────────────────────────────────────────┤
│ Recent Activity Feed                             │
└──────────────────────────────────────────────────┘
```

---

### List Page Layout

```
┌──────────────────────────────────────────────────┐
│ Research Projects                                │
│ [+ Create] [Filter ▼] [Search...]               │
├──────────────────────────────────────────────────┤
│ Filters Applied:                                 │
│ [District: Ahmedabad ✕] [Stage: Draft ✕]        │
├──────────────────────────────────────────────────┤
│ Showing 23 of 127 results                        │
│                                                  │
│ ┌────────────────────────────────────────────┐  │
│ │ Project 1 │ Amd │ Draft  │ Progress [─ 50%]│ │
│ ├────────────────────────────────────────────┤  │
│ │ Project 2 │ Mum │ Active │ Progress [─ 75%]│ │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ [ ◄ 1 2 3 ... 10 ► ]                           │
└──────────────────────────────────────────────────┘
```

---

### Detail Page Layout

```
┌──────────────────────────────────────────┬──────────────────┐
│ ◄ Back | Research > Project Name         │ Sidebar (25%)    │
├──────────────────────────────────────────┤                  │
│                                          │ Quick Info:      │
│ Project Title                            │ • Status: Active │
│ [Verified] [Active] [Edit] [...]         │ • Created: 6m    │
│                                          │                  │
│ Description                              │ Related:         │
│ Lorem ipsum dolor sit amet...            │ • Startup (1)    │
│                                          │ • Patent (1)     │
│ Milestones:                              │                  │
│ ✓ Concept    (Completed)                 │ Actions:         │
│ ◯ Lab Testing (In Progress)              │ [Share] [Edit]   │
│ ◯ Field Trial (Upcoming)                 │        [Delete]  │
│                                          │                  │
│ Linked Records:                          │                  │
│ • Innovation 1 (Prototype)               │                  │
│ • Patent 1 (Filed)                       │                  │
│                                          │                  │
└──────────────────────────────────────────┴──────────────────┘
```

---

### Form Layout

```
┌──────────────────────────────────────────┐
│ Create Research Project                  │
├──────────────────────────────────────────┤
│                                          │
│ Title *                                  │
│ [Research Project Name...............]  │
│                                          │
│ Description                              │
│ [Lorem ipsum...........................] │
│ 450/2000 characters                      │
│                                          │
│ Sector * (required)                      │
│ ◯ AgriTech  ◯ HealthTech  ◯ FinTech     │
│                                          │
│ Status: Draft                            │
│ [Read-only field]                        │
│                                          │
├──────────────────────────────────────────┤
│ [Back]  [Save & Continue]                │
└──────────────────────────────────────────┘
```

---

## QUICK REFERENCE: ACCESSIBILITY

### Keyboard Navigation Checklist

```
✓ Tab cycles through interactive elements
✓ Shift+Tab goes backward
✓ Enter activates buttons/links
✓ Space activates buttons/checkboxes
✓ Escape closes modals/dropdowns
✓ Arrow keys navigate lists/menus
✓ No keyboard traps
✓ Focus order logical (top-to-bottom, left-to-right)
✓ Focus indicator visible (3px blue outline)
✓ Skip navigation link at top of page
```

### Screen Reader Checklist

```
✓ All buttons have descriptive text
✓ All inputs have associated labels
✓ All images have alt text
✓ Headings structured (H1 → H2 → H3)
✓ Form errors linked with aria-describedby
✓ Current page marked with aria-current="page"
✓ Modals have role="dialog" aria-modal="true"
✓ Live regions for toasts (role="status" aria-live="polite")
✓ No hidden content for visual-only users
```

### Color Contrast Checklist

```
✓ Text on background ≥ 4.5:1
✓ Large text (18px+) ≥ 3:1
✓ All UI elements meet standards
✓ Error messages readable
✓ No color as only indicator
✓ Icon + text combination for status indicators
✓ Test with WebAIM Contrast Checker
```

---

## QUICK REFERENCE: RESPONSIVE DESIGN

### Breakpoints

```
Mobile:   max-width 480px  (1 column, hamburger menu)
Tablet:   481px - 768px    (2 columns, compact sidebar)
Desktop:  769px - 1024px   (3-column with sidebar, full layout)
Wide:     1025px+          (12-column grid, max-width 1200px)
```

### Mobile-First Implementation

```css
/* Start with mobile */
.grid {
  grid-template-columns: 1fr;  /* Single column */
}

/* Tablet: 2 columns */
@media (min-width: 481px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 columns */
@media (min-width: 769px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Wide desktop */
@media (min-width: 1025px) {
  .container {
    max-width: 1200px;
  }
}
```

### Touch Targets

```
✓ Minimum 44×44px for any tappable element
✓ Adequate spacing between targets (≥ 4px)
✓ Font size ≥ 12px on mobile
✓ No horizontal scroll (except tables)
✓ Input fields properly sized for mobile keyboard
```

---

## QUICK REFERENCE: COMMON PATTERNS

### Error Message Pattern

```
[Input field]
Error message in red (12px, weight 500)
"✗ Email is required" or "✗ Invalid email format"

Color: --red-500 (#ef4444)
Contrast: 5.8:1 on white ✓
```

### Success State Pattern

```
[Input field] [✓ Verified]
Green checkmark on right side
Fade in animation (200ms)
```

### Loading State Pattern

```
Button: "[ ◯ Saving... ]"  (spinning spinner + text)
Disabled state during load
Auto-enable on complete
Show success/error toast
```

### Empty State Pattern

```
┌─────────────────────┐
│   [Icon image]      │
│                     │
│ No items found      │ (H2, bold)
│                     │
│ Create your first   │ (Body text)
│ record to get       │
│ started.            │
│                     │
│ [+ Create Item]     │ (Primary button CTA)
└─────────────────────┘
```

### Filter Pattern

```
[+ Create] [Filter ▼] [Search...]

Dropdown menu:
  ☐ District: [ Dropdown ▼ ]
  ☐ Stage: [ Dropdown ▼ ]
  ☐ Sector: [ Dropdown ▼ ]
  
  [Clear All] [Apply Filters]

Applied filters displayed as pills:
[District: Ahmedabad ✕] [Stage: Draft ✕]
```

---

## QUICK REFERENCE: ANIMATION GUIDE

### Hover Animation

```css
transition: var(--transition-fast);

.button:hover {
  background-color: darker-shade;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**Duration:** 150ms (snappy)
**Effect:** Darker color + lift + shadow

---

### Modal Open Animation

```css
@keyframes slideUp {
  from {
    transform: translate(-50%, -40%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
}

.modal {
  animation: slideUp 0.2s ease-out;
}
```

**Duration:** 200ms
**Effect:** Slide up from bottom + fade in

---

### Loading Spinner Animation

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 0.6s linear infinite;
}
```

**Duration:** 0.6s
**Effect:** Continuous rotation

---

### Fade In Animation

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.content {
  animation: fadeIn 0.2s ease-out;
}
```

**Duration:** 200ms
**Effect:** Opacity 0 to 100%

---

## IMPLEMENTATION CHECKLIST

### Frontend Developer Checklist

Before submitting code:

- [ ] Component uses design tokens (no hardcoded colors)
- [ ] Spacing follows 8px grid
- [ ] Font size from approved scale
- [ ] Touch targets ≥ 44×44px
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicator visible
- [ ] Color contrast ≥ 4.5:1
- [ ] Mobile responsive (mobile-first)
- [ ] No console errors
- [ ] CSS organized (no random inline styles)
- [ ] Props documented
- [ ] Unit tests passing
- [ ] No hardcoded values (use variables)

---

### Designer Checklist

Before handing off to development:

- [ ] All components defined (colors, spacing, typography)
- [ ] Responsive breakpoints specified
- [ ] Animation timings documented
- [ ] Accessibility requirements listed
- [ ] Edge cases sketched (empty, error, loading, disabled)
- [ ] Mobile layouts distinct from desktop
- [ ] Touch targets marked 44px minimum
- [ ] Focus states designed
- [ ] Dark mode considered
- [ ] All colors tested for contrast
- [ ] Figma file organized and linked

---

### QA Checklist

Before releasing:

- [ ] All components render correctly
- [ ] No console errors
- [ ] Keyboard navigation complete
- [ ] Accessibility tested (NVDA, VoiceOver)
- [ ] Color contrast verified
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance acceptable (< 3s load)
- [ ] Animations smooth (60 fps)
- [ ] No memory leaks
- [ ] Error states handled
- [ ] Touch targets tested on real device

---

## RESOURCE LINKS

**Design Tools:**
- Figma: https://www.figma.com/
- Adobe XD: https://www.adobe.com/products/xd.html

**Accessibility Testing:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WAVE Tool: https://wave.webaim.org/
- NVDA Screen Reader: https://www.nvaccess.org/
- AXE DevTools: https://www.deque.com/axe/devtools/

**Performance Testing:**
- Lighthouse: Chrome DevTools built-in
- WebPageTest: https://www.webpagetest.org/
- GTmetrix: https://gtmetrix.com/

**Documentation:**
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- MDN Web Docs: https://developer.mozilla.org/
- Web.dev: https://web.dev/

---

## FINAL NOTES

This design system is your source of truth. Every designer and developer should:

1. **Reference this document** when making design decisions
2. **Use design tokens** (never hardcode values)
3. **Test accessibility** before submitting code
4. **Maintain consistency** across all pages
5. **Document variations** when you deviate

Consistency beats perfection. A slightly-imperfect-but-consistent design beats a perfect-but-inconsistent design.

Every pixel, every interaction, every color serves one purpose: **Trust through Transparency**.

Build with this principle in mind, and you'll create something users love.

---

**Design System v2.0**
**Last Updated:** August 19, 2026
**Maintainer:** UdaanSetu Design Team
**Status:** PRODUCTION-READY ✓

**Use this. Reference this. Own this.**
