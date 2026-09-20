import type { Client, PaymentDueMethod, Project } from '../types';

export const normalizeDueDays = (value: string | number[] | undefined) =>
  [...new Set((Array.isArray(value) ? value : (value || '').split(','))
    .map((day) => Number(String(day).trim()))
    .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31))].sort((a, b) => a - b);

export const getPaymentDueMethod = (project: Pick<Project, 'billingModel' | 'paymentDueMethod' | 'paymentDueDay' | 'paymentDueDays'>): PaymentDueMethod | undefined => {
  if (project.billingModel === 'hourly') return undefined;
  if (project.paymentDueMethod) return project.paymentDueMethod;
  return project.billingModel === 'fixed' ? 'split-50-50' : 'due-days';
};

const ordinal = (day: number) => {
  const suffix = day % 10 === 1 && day % 100 !== 11 ? 'st' : day % 10 === 2 && day % 100 !== 12 ? 'nd' : day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th';
  return `${day}${suffix}`;
};

const joinDays = (days: number[], ar: boolean) => {
  const labels = days.map((day) => ar ? String(day) : ordinal(day));
  if (labels.length < 2) return labels[0] || (ar ? '1' : '1st');
  return `${labels.slice(0, -1).join(ar ? '، ' : ', ')}${ar ? ' و' : ' and '}${labels.at(-1)}`;
};

export const paymentSchedule = (project: Pick<Project, 'billingModel' | 'paymentDueMethod' | 'paymentDueDay' | 'paymentDueDays' | 'totalAmount' | 'currency'>, ar: boolean) => {
  const method = getPaymentDueMethod(project);
  const days = normalizeDueDays(project.paymentDueDays?.length ? project.paymentDueDays : project.paymentDueDay ? [project.paymentDueDay] : []);
  const value = new Intl.NumberFormat(ar ? 'ar-EG' : 'en-GB', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(project.totalAmount);
  const half = new Intl.NumberFormat(ar ? 'ar-EG' : 'en-GB', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(project.totalAmount / 2);

  if (project.billingModel === 'hourly') return ar
    ? 'تستحق الدفعات وفق سجلات الوقت المعتمدة وطريقة الدفع المتفق عليها.'
    : 'Payment is due according to approved time records and the agreed payment method.';
  if (method === 'due-days') return ar
    ? `تستحق الدفعات في يوم ${joinDays(days, true)} من كل شهر.`
    : `Payment is due on the ${joinDays(days, false)} of every month.`;
  if (project.billingModel === 'fixed') return ar
    ? `تُسدد القيمة الإجمالية ${value} ${project.currency} بنسبة 50% (${half} ${project.currency}) عند البدء و50% عند اعتماد التسليم قبل الإطلاق.`
    : `The total ${value} ${project.currency} is paid 50% (${half} ${project.currency}) at commencement and 50% upon delivery approval before launch.`;
  return ar
    ? `تُسدد القيمة الشهرية ${value} ${project.currency} بنسبة 50% (${half} ${project.currency}) في بداية الفترة و50% في منتصفها.`
    : `The monthly value of ${value} ${project.currency} is paid 50% (${half} ${project.currency}) at the beginning of the period and 50% mid-period.`;
};

const scopeIsWeb = (project: Project) => project.services.some((service) => /web|website|ui\/?ux|development|تطوير|موقع/i.test(`${service.name} ${service.nameAr || ''}`));
const hasAds = (project: Project) => project.services.some((service) => /media buying|performance|advert|campaign|ads|إعلان/i.test(`${service.name} ${service.nameAr || ''}`));

export const generateContractTerms = (project: Project, client?: Client) => {
  const web = scopeIsWeb(project);
  const recurring = project.billingModel === 'monthly' || project.billingModel === 'retainer';
  const reference = project.refId || client?.refId || 'MFx';
  const scope = project.services.map((service) => service.name).join(', ') || 'the agreed services';
  const payment = paymentSchedule(project, false);
  const paymentAr = paymentSchedule(project, true);
  const en = [
    `1. Scope: Deliverables strictly follow Project ${reference} (${scope}); out-of-scope requests require written approval and separate billing.`,
    `2. Payments: ${payment} Work may pause while any due amount remains unpaid.`,
    web ? '3. Revisions: The scope includes up to 3 rounds of consolidated revisions. Structural redesigns or post-approval changes are billed separately.' : '3. Change requests: Any work outside the approved monthly scope, volume, or deliverables is quoted and approved separately.',
    `4. Timeline & feedback: The Client must provide consolidated feedback and required assets within ${web ? '3 business days' : '48 hours'} to preserve the delivery timeline.`,
    hasAds ? '5. Ad spend: Direct media budgets are funded by the Client and spent only after written approval. Platform charges are not Agency revenue.' : '5. External costs: Third-party expenses, licenses, locations, models, hosting, and external tools are billed separately when required.',
    '6. Ownership: Final approved assets and applicable master files transfer to the Client only after full settlement of all outstanding invoices.',
    '7. Confidentiality: Both parties keep non-public business, commercial, sales, strategy, and project information confidential.',
    web ? '8. Warranty & support: The Agency provides 30 days of post-launch bug-fixing for the delivered scope. New features, integrations, and changes are excluded.' : '8. Performance: The Agency guarantees professional execution of the agreed scope, not direct sales, platform outcomes, or market performance.',
    recurring ? '9. Suspension & termination: This agreement renews monthly. Either party may cancel with 30 days written notice; overdue work may be suspended immediately.' : '9. Cancellation: Advance mobilisation payments are non-refundable once production has commenced. Cancellation requires written notice and settlement of completed work.',
    web ? '10. Deployment & handover: Production files, credentials, and deployment handover are released after final financial clearance.' : '10. Handover: Final approved deliverables and access are handed over after final financial clearance.'
  ].join('\n\n');
  const ar = [
    `1. نطاق العمل: تلتزم المخرجات حصراً بمشروع ${reference} (${scope})، وأي طلب خارج النطاق يحتاج موافقة كتابية وتسعيراً مستقلاً.`,
    `2. المدفوعات: ${paymentAr} ويحق للوكالة إيقاف العمل عند وجود أي مبلغ مستحق غير مسدد.`,
    web ? '3. المراجعات: يشمل النطاق حتى 3 جولات مراجعة مجمعة. إعادة التصميم الهيكلية أو التعديلات بعد الاعتماد تُسعّر بشكل منفصل.' : '3. طلبات التغيير: أي عمل خارج النطاق أو حجم العمل أو المخرجات المعتمدة يُسعّر ويعتمد بشكل منفصل.',
    `4. الجدول الزمني والملاحظات: يلتزم العميل بإرسال الملاحظات المجمعة والأصول المطلوبة خلال ${web ? '3 أيام عمل' : '48 ساعة'} للحفاظ على الجدول الزمني.`,
    hasAds ? '5. الميزانية الإعلانية: يمول العميل الميزانية الإعلامية مباشرة ولا يتم إنفاقها إلا بعد موافقة كتابية. رسوم المنصات ليست إيراداً للوكالة.' : '5. التكاليف الخارجية: تُحاسب مصروفات الأطراف الثالثة والتراخيص والمواقع والنماذج والاستضافة والأدوات الخارجية بصورة مستقلة عند الحاجة.',
    '6. الملكية: تنتقل الأصول النهائية المعتمدة وملفات المصدر ذات الصلة إلى العميل بعد السداد الكامل لجميع الفواتير المستحقة فقط.',
    '7. السرية: يحافظ الطرفان على سرية بيانات الأعمال والمبيعات والاستراتيجية والمعلومات التجارية ومعلومات المشروع غير العامة.',
    web ? '8. الضمان والدعم: تقدم الوكالة 30 يوماً لإصلاح أخطاء التنفيذ ضمن النطاق المسلّم بعد الإطلاق. لا تشمل الميزة الجديدة أو التكاملات أو التعديلات الجديدة.' : '8. الأداء: تضمن الوكالة تنفيذ النطاق المتفق عليه باحترافية، ولا تضمن أرقام المبيعات أو نتائج المنصات أو أداء السوق.',
    recurring ? '9. الإيقاف والإنهاء: يتجدد الاتفاق شهرياً، ويجوز لأي طرف الإنهاء بإشعار كتابي قبل 30 يوماً. ويجوز إيقاف العمل فوراً عند التأخر في السداد.' : '9. الإلغاء: دفعات بدء التنفيذ غير قابلة للاسترداد بعد بدء الإنتاج. ويتطلب الإلغاء إشعاراً كتابياً وسداد قيمة العمل المنجز.',
    web ? '10. الإطلاق والتسليم: تُسلّم ملفات الإنتاج وبيانات الدخول وخطوات الإطلاق بعد التسوية المالية النهائية.' : '10. التسليم: تُسلّم المخرجات النهائية المعتمدة وبيانات الوصول بعد التسوية المالية النهائية.'
  ].join('\n\n');
  return { en, ar };
};
