> Historical milestone document. Its completion claims are superseded by README.md and PROJECT_COMPLETE.md (18 September 2026).

# 🎯 Quick Start Guide - MFx Digital Hub

## 🚀 الوصول للنظام

السيرفر شغال دلوقتي على: **http://localhost:5173/**

افتح المتصفح واكتب العنوان ده وهتلاقي النظام جاهز!

---

## 📋 الواجهات المتاحة

### 1️⃣ Dashboard (لوحة المعلومات)
**الموجود فيها:**
- إجمالي الإيرادات والمدفوعات والمتبقي
- عدد المشاريع النشطة
- رسم بياني للإيرادات الشهرية (آخر 6 شهور)
- توزيع حالات الدفع (Pie Chart)
- المواعيد النهائية القادمة (Upcoming Deadlines)
- إحصائيات الوقت المُتتبع (Time Tracking)
- تنبيهات المشاريع المتأخرة

### 2️⃣ Workspace (مساحة العمل)
**الموجود فيها:**
- قائمة بكل المشاريع والعملاء
- بحث متقدم (Search) بالاسم أو Ref ID أو رقم الهاتف
- فلتر حسب حالة المشروع (Active, Paused, Completed, Cancelled)
- لكل مشروع:
  - معلومات العميل كاملة
  - الخدمات المقدمة
  - المبالغ المالية (إجمالي، مدفوع، متبقي)
  - طريقة الدفع والموعد النهائي
  - أزرار الإجراءات:
    - ▶️ **Start/Stop Timer**: تشغيل عداد الوقت
    - 📄 **Generate Invoice**: تحميل فاتورة PDF
    - 📋 **Generate Contract**: تحميل عقد PDF
    - 🔗 **Open Drive**: فتح مجلد الـ Drive
    - ✏️ **Edit**: تعديل المشروع
    - 🗑️ **Delete**: حذف المشروع

---

## 🎨 المميزات الرئيسية

### ✅ Color Coding
كل عميل ليه لون مميز بيظهر في الشريط الجانبي للمشروع

### ✅ Light & Dark Mode
اضغط على أيقونة الشمس/القمر في الـ Sidebar

### ✅ Time Tracking
- اضغط ▶️ لبدء العداد
- العداد يشتغل في الخلفية
- اضغط ⏸️ لإيقاف العداد وحساب الساعات تلقائياً
- الساعات تتسجل وتظهر في الـ Dashboard

### ✅ PDF Generation

#### Invoice (الفاتورة):
- تصميم احترافي مطابق للـ HTML اللي بعتته
- بيانات العميل كاملة
- جدول الخدمات
- الحسابات (Subtotal, Tax, Discount, Total)
- بالجنيه المصري (£)
- Logo و branding MFx

#### Contract (العقد):
- اتفاقية خدمة كاملة
- نطاق الخدمات
- الشروط المالية
- شروط وأحكام قياسية (قابلة للتخصيص)
- أماكن للتوقيع

---

## 📊 البيانات التجريبية

النظام جاي بـ 2 عميل من الـ Google Sheet بتاعك:

### Client 1: **Al Houlie & Zynah**
- Ref: MFx-26001
- Contact: Ahmed Al-Shourbagy
- Service: Full Management Retainer
- Amount: £36,000
- Status: Pending Payment
- Notes: 25% deduction on Zynah brand ads

### Client 2: **Ghada Beauty & More**
- Ref: MFx-26002
- Contact: Ghada Salama
- Services: Web Development + Branding
- Amount: £36,500 (50% paid)
- Status: Partial Payment
- Notes: Profile in revision, website in progress

---

## 🔧 التخصيص

### إضافة عميل/مشروع جديد:
حالياً الزر موجود بس الـ Form لسه محتاج يتعمل. البنية التحتية جاهزة في الـ Store.

### تعديل الخدمات:
روح على `src/store/useStore.ts` → `servicesCatalog`

### تغيير الألوان:
روح على `tailwind.config.js` وغير الـ colors

### تغيير العملة:
في كل مشروع فيه `currency` و `currencySymbol`

---

## 💾 حفظ البيانات

- كل البيانات بتتحفظ تلقائياً في المتصفح (localStorage)
- لو عملت Refresh للصفحة، البيانات هتفضل موجودة
- مفيش Backend أو Database مطلوب
- البيانات مش بتطلع من جهازك

---

## 🎯 الخطوات الجاية

لو عايز تكمل النظام:

1. **Forms للإضافة/التعديل**: Modal components لإضافة/تعديل العملاء والمشاريع
2. **Google Sheets Integration**: ربط مع Google Sheets API للـ sync التلقائي
3. **Upload Logos**: إمكانية رفع لوجو العملاء
4. **Advanced Reports**: تقارير مالية وتحليلات متقدمة
5. **Notifications**: تنبيهات للمواعيد والدفعات
6. **Team Management**: إدارة أعضاء الفريق (Nahas, Moawad, etc.)
7. **File Attachments**: رفع ملفات للمشاريع
8. **Comments & Notes**: نظام تعليقات للتواصل
9. **Email Integration**: إرسال Invoices و Contracts بالإيميل
10. **Backup/Export**: تصدير البيانات إلى Excel/CSV

---

## 🐛 إذا واجهت مشكلة

### السيرفر مش شغال؟
```bash
cd D:\MFx\mfx-workspace
npm run dev
```

### المتصفح بيطلع error؟
اعمل Ctrl+Shift+R (Hard Refresh)

### البيانات اختفت؟
افتح Developer Tools → Application → Local Storage → localhost:5173 → مفتاح `mfx-storage`

---

## 📞 التواصل

أي سؤال أو تطوير إضافي، أنا موجود! 

**Happy Managing! 🚀**

