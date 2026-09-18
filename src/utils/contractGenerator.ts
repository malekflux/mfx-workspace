import jsPDF from 'jspdf';
import { ContractData } from '../types';
import { format } from 'date-fns';

export const generateContractPDF = (data: ContractData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const primaryColor: [number, number, number] = [11, 88, 189];
  const darkColor: [number, number, number] = [15, 23, 42];
  const slateColor: [number, number, number] = [71, 85, 105];

  // Top bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 5, 'F');

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SERVICE AGREEMENT', 105, 25, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
  doc.text(`Contract No: ${data.contractNumber}`, 105, 32, { align: 'center' });
  doc.text(`Date: ${format(new Date(data.date), 'MMMM dd, yyyy')}`, 105, 37, { align: 'center' });

  let yPos = 50;

  // Parties Section
  doc.setFillColor(248, 250, 252);
  doc.rect(14, yPos - 5, 182, 8, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('PARTIES TO THIS AGREEMENT', 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Service Provider:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text('MFx Digital Solutions', 20, yPos);
  yPos += 4;
  doc.text('www.mfx360.com', 20, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text(data.client.businessName, 20, yPos);
  yPos += 4;
  doc.text(`Contact: ${data.client.contactPerson}`, 20, yPos);
  yPos += 4;
  doc.text(`Phone: ${data.client.phone}`, 20, yPos);

  // Services Section
  yPos += 15;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, yPos - 5, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('SCOPE OF SERVICES', 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  data.services.forEach((service, index) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${service.name}`, 14, yPos);
    yPos += 5;

    if (service.description) {
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(service.description, 170);
      doc.text(descLines, 20, yPos);
      yPos += descLines.length * 4;
    }

    if (service.subServices && service.subServices.length > 0) {
      service.subServices.forEach(sub => {
        doc.text(`• ${sub}`, 20, yPos);
        yPos += 4;
      });
    }

    yPos += 3;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Financial Terms
  yPos += 10;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(14, yPos - 5, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('FINANCIAL TERMS', 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const total = data.services.reduce((sum, s) => sum + s.basePrice, 0);
  doc.text(`Total Contract Value: ${data.project.currencySymbol}${total.toLocaleString('en-US')}`, 14, yPos);
  yPos += 5;
  doc.text(`Billing Model: ${data.project.billingModel.toUpperCase()}`, 14, yPos);
  yPos += 5;
  doc.text(`Payment Method: ${data.project.paymentMethod.toUpperCase()}`, 14, yPos);
  yPos += 5;

  if (data.startDate) {
    doc.text(`Start Date: ${format(new Date(data.startDate), 'MMMM dd, yyyy')}`, 14, yPos);
    yPos += 5;
  }

  if (data.endDate) {
    doc.text(`End Date: ${format(new Date(data.endDate), 'MMMM dd, yyyy')}`, 14, yPos);
    yPos += 5;
  }

  // Terms & Conditions
  yPos += 10;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(14, yPos - 5, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TERMS & CONDITIONS', 14, yPos);

  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const defaultTerms = [
    // English Terms
    '1. Payment Terms: Client agrees to pay the total contract value as per the agreed payment schedule. Late payments may incur interest charges of 2% per month.',

    '2. Deliverables Ownership: All deliverables, including but not limited to designs, content, and code, remain the intellectual property of MFx Digital Solutions until full payment is received.',

    '3. Client Responsibilities: Client is responsible for providing timely feedback, necessary materials (logos, images, content), and access to required platforms within 48 hours of request.',

    '4. Scope Changes: Any modifications or additions to the original scope of work will be subject to additional charges and timeline adjustments, to be agreed upon in writing.',

    '5. Cancellation & Termination: Either party may terminate this agreement with 30 days written notice. Client remains liable for all work completed up to the termination date.',

    '6. Confidentiality: Both parties agree to keep all confidential information shared during the project strictly confidential and not disclose it to third parties.',

    '7. Intellectual Property Rights: Upon full payment, all intellectual property rights for the deliverables transfer to the client, except for pre-existing materials and MFx proprietary tools.',

    '8. Portfolio Usage: MFx Digital Solutions reserves the right to showcase the completed work in its portfolio and marketing materials unless otherwise agreed in writing.',
  ];

  const arabicTerms = [
    // Arabic Terms
    'شروط وأحكام إضافية (Arabic):',
    '',
    '١. شروط الدفع: يوافق العميل على دفع القيمة الإجمالية للعقد وفقاً لجدول الدفع المتفق عليه. التأخير في السداد قد يؤدي لفوائد 2% شهرياً.',

    '٢. ملكية التسليمات: جميع المخرجات تبقى ملكية فكرية لـ MFx حتى استلام الدفعة الكاملة.',

    '٣. مسؤوليات العميل: العميل مسؤول عن تقديم الملاحظات والمواد اللازمة خلال 48 ساعة من الطلب.',

    '٤. تغيير النطاق: أي تعديلات على النطاق الأصلي تخضع لرسوم إضافية يتم الاتفاق عليها كتابياً.',

    '٥. الإلغاء: يمكن لأي طرف إنهاء الاتفاقية بإشعار كتابي قبل 30 يوماً.',

    '٦. السرية: الطرفان يتعهدان بالحفاظ على سرية جميع المعلومات المشتركة.',

    '٧. حقوق الملكية: عند الدفع الكامل، تنتقل حقوق الملكية الفكرية للعميل.',

    '٨. استخدام Portfolio: MFx يحتفظ بحق عرض الأعمال في محفظته التسويقية.',
  ];

  // Combine both English and Arabic terms
  const allTerms = [...defaultTerms, '', ...arabicTerms];

  allTerms.forEach((term) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    if (term === '') {
      yPos += 5;
      return;
    }

    const termLines = doc.splitTextToSize(term, 175);
    doc.text(termLines, 14, yPos);
    yPos += termLines.length * 5 + 2;
  });

  // Signatures
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(14, yPos, 80, yPos);
  doc.line(130, yPos, 196, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MFx Digital Solutions', 14, yPos);
  doc.text(data.client.businessName, 130, yPos);

  yPos += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('Service Provider Signature & Date', 14, yPos);
  doc.text('Client Signature & Date', 130, yPos);

  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 280, 210, 17, 'F');

  doc.setFontSize(8);
  doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
  doc.text('MFx Digital Solutions | www.mfx360.com', 105, 290, { align: 'center' });

  return doc;
};
