> Historical milestone document. Its completion claims are superseded by README.md and PROJECT_COMPLETE.md (18 September 2026).

# 🎨 Advanced Features Guide

## 🔥 المميزات المتقدمة الموجودة

### 1. Real-time Time Tracking
```typescript
// كيفية استخدام الـ Timer
const { startTimer, stopTimer, activeTimeEntry } = useStore();

// بدء التتبع
startTimer(projectId, 'Working on homepage design');

// إيقاف التتبع (يحسب الوقت تلقائياً)
stopTimer();
```

**Features:**
- Timer يشتغل في الخلفية
- حساب تلقائي للساعات بالميلي ثانية
- مؤشر مرئي للـ Timer النشط
- إحصائيات شهرية تلقائية

### 2. Color Coding System
كل عميل بيتحدد له لون مخصص:
```typescript
const client = {
  color: '#0b58bd', // Primary blue
  // or '#f59e0b', '#10b981', '#8b5cf6', etc.
};
```

الألوان بتظهر في:
- Border جانبي للمشروع
- Client badge
- Charts & Graphs

### 3. Advanced Filtering & Search
```typescript
// البحث يشتغل على:
- Client business name
- Contact person name
- Phone number
- Reference ID
- Project notes

// الفلترة حسب:
- Project Status (active/paused/completed/cancelled)
- Payment Status (paid/partial/pending/overdue)
```

### 4. Financial Analytics
Dashboard بيحسب تلقائياً:
- Total Revenue (إجمالي الإيرادات)
- Total Collected (المحصل)
- Outstanding Amount (المتبقي)
- Collection Rate (نسبة التحصيل)
- Monthly Trends (الاتجاهات الشهرية)

### 5. PDF Generation Engine

#### Invoice PDF Features:
- Professional MFx branding
- Client logo support (ready for upload feature)
- Auto-calculated totals
- Tax & discount support
- Multi-service breakdown
- Payment terms section
- Signature area

#### Contract PDF Features:
- Legal agreement template
- Service scope documentation
- Financial terms
- Customizable T&C
- Both parties signatures
- Multi-page support

### 6. Smart Notifications System
Dashboard alerts:
- 🔴 Overdue projects
- 🟡 Upcoming deadlines (next 7 days)
- 🟢 Completed milestones

---

## 🛠️ كيفية التخصيص

### إضافة خدمة جديدة للكتالوج:
```typescript
// في src/store/useStore.ts
addServiceToCatalog({
  id: 'svc_new',
  name: 'Social Media Ads',
  description: 'Facebook & Instagram advertising',
  subServices: ['Campaign Setup', 'A/B Testing', 'Performance Reports'],
  basePrice: 8000,
  isRecurring: true,
  isVariable: true,
});
```

### تخصيص شروط العقود:
```typescript
// في src/utils/contractGenerator.ts
const defaultTerms = [
  'Payment terms as agreed upon in the project proposal.',
  'All deliverables remain property of MFx until full payment is received.',
  // أضف شروطك هنا
];
```

### تخصيص ألوان الـ Status:
```typescript
// في src/components/Workspace.tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'urgent': return 'bg-red-100 text-red-800'; // مثال جديد
    // أضف حالات جديدة
  }
};
```

---

## 📊 Data Structure

### Client Object:
```typescript
interface Client {
  id: string;              // Unique ID
  refId: string;           // MFx-XXXXX
  businessName: string;    // Company name
  contactPerson: string;   // Contact name
  phone: string;           // Phone number
  email?: string;          // Email (optional)
  logoUrl?: string;        // Logo URL (optional)
  color?: string;          // Hex color code
}
```

### Project Object:
```typescript
interface Project {
  id: string;
  clientId: string;        // Links to Client
  refId: string;           // Same as client refId
  services: Service[];     // Array of services
  billingModel: 'monthly' | 'fixed' | 'hourly' | 'retainer';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'instapay' | 'bank-transfer' | 'cash' | 'card';
  paymentDueDay?: number;  // 1-31
  contractStartDate: string; // ISO date
  deadline?: string;       // ISO date
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  projectStatus: 'active' | 'paused' | 'completed' | 'cancelled';
  driveLink?: string;      // Google Drive URL
  accountPIC?: string[];   // Account managers
  notes?: string;
  currency: 'EGP' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;  // £, $, €, etc.
}
```

### Time Entry Object:
```typescript
interface TimeEntry {
  id: string;
  projectId: string;
  startTime: string;       // ISO timestamp
  endTime?: string;        // ISO timestamp
  duration?: number;       // Milliseconds
  description?: string;
  isActive: boolean;
}
```

---

## 🔌 Integration Ideas

### Google Sheets API Integration:
```typescript
// Pseudo code
async function syncWithGoogleSheets() {
  const sheets = await fetchGoogleSheet(SHEET_ID);
  const rows = sheets.values;
  
  rows.forEach(row => {
    const client = parseClientFromRow(row);
    const project = parseProjectFromRow(row);
    addClient(client);
    addProject(project);
  });
}
```

### Email Integration (Example with EmailJS):
```typescript
import emailjs from '@emailjs/browser';

async function sendInvoiceEmail(invoiceData, clientEmail) {
  const pdfBlob = generateInvoicePDF(invoiceData).output('blob');
  
  await emailjs.send('service_id', 'template_id', {
    to_email: clientEmail,
    subject: `Invoice ${invoiceData.invoiceNumber}`,
    attachment: pdfBlob,
  });
}
```

### WhatsApp Integration:
```typescript
function sendWhatsAppInvoice(phone: string, invoiceNumber: string) {
  const message = `Hello! Your invoice ${invoiceNumber} is ready. Total: £${total}`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
```

---

## 🎯 Performance Tips

### 1. Lazy Loading:
```typescript
// للمشاريع الكبيرة، استخدم pagination
const [page, setPage] = useState(1);
const projectsPerPage = 20;
const displayedProjects = filteredProjects.slice(
  (page - 1) * projectsPerPage,
  page * projectsPerPage
);
```

### 2. Debounced Search:
```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
);
```

### 3. Memoization:
```typescript
import { useMemo } from 'react';

const expensiveCalculation = useMemo(() => {
  return projects.reduce((sum, p) => sum + p.totalAmount, 0);
}, [projects]);
```

---

## 🔒 Security Considerations

### 1. Data Sanitization:
```typescript
// قبل حفظ البيانات
const sanitizeInput = (input: string) => {
  return input.replace(/<script.*?>.*?<\/script>/gi, '');
};
```

### 2. Backup Strategy:
```typescript
// Export data regularly
function exportBackup() {
  const data = localStorage.getItem('mfx-storage');
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mfx-backup-${new Date().toISOString()}.json`;
  a.click();
}
```

### 3. Import Backup:
```typescript
function importBackup(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = e.target?.result as string;
    localStorage.setItem('mfx-storage', data);
    window.location.reload();
  };
  reader.readAsText(file);
}
```

---

## 📱 Mobile Optimization

النظام responsive بالكامل:
- Sidebar بيتحول لـ Mobile menu
- Tables بتتحول لـ Cards
- Touch-friendly buttons
- Swipe gestures support (ready to implement)

---

## 🚀 Deployment Options

### 1. Static Hosting (Netlify/Vercel):
```bash
npm run build
# Upload dist/ folder
```

### 2. GitHub Pages:
```bash
npm install -D gh-pages
# Add to package.json:
"homepage": "https://yourusername.github.io/mfx-workspace",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
npm run deploy
```

### 3. Self-hosted:
```bash
npm run build
# Copy dist/ to your server
# Configure nginx/apache
```

---

## 🎓 Learning Resources

- **Zustand**: https://github.com/pmndrs/zustand
- **Recharts**: https://recharts.org/
- **jsPDF**: https://github.com/parallax/jsPDF
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/

---

Built with 💙 for MFx Digital Solutions

