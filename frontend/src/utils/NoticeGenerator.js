import { jsPDF } from 'jspdf';

/**
 * Generates a professional PDF notice for an event.
 * Replicates the "Government Polytechnic, Awasari" style.
 */
export const generateNoticePDF = (event, user) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // ─── Institutional Header ───────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GOVERNMENT POLYTECHNIC, AWASARI', pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(12);
    const deptName = user?.branch === 'IT' ? 'DEPARTMENT OF INFORMATION TECHNOLOGY' :
        user?.branch === 'CS' ? 'DEPARTMENT OF COMPUTER SCIENCE' :
            `DEPARTMENT OF ${user?.branch || 'GENERAL'}`;
    doc.text(deptName, pageWidth / 2, 40, { align: 'center' });

    // Horizontal Line
    doc.setLineWidth(0.5);
    doc.line(margin, 45, pageWidth - margin, 45);

    // Academic Year
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const currentYear = new Date().getFullYear();
    const academicYear = `A. Y. ${currentYear}-${(currentYear + 1).toString().slice(-2)} Even ${currentYear + 1}`;
    doc.text(academicYear, pageWidth / 2, 55, { align: 'center' });

    // "Notice" Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Notice', pageWidth / 2, 70, { align: 'center' });

    // ─── Body Content ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

    const branchLabel = event.branch === 'ALL' ? 'all branches' : event.branch;
    const bodyText = `All the students of ${branchLabel} are informed that ${user?.branch || 'the'} department organized "${event.title}" competition on date ${dateStr} at ${timeStr} ${event.venue}. Interested candidate can register their name through the portal.`;

    // Split text into lines for wrapping
    const splitBody = doc.splitTextToSize(bodyText, pageWidth - (margin * 2));
    doc.text(splitBody, margin, 90, { lineHeightFactor: 1.5 });

    // ─── Signature Blocks ───────────────────────────────────────────────────
    const sigY = 180;

    // Faculty Coordinator
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || 'Faculty Coordinator', margin + 30, sigY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Faculty Coordinator', margin + 30, sigY + 10, { align: 'center' });

    // HOD
    doc.setFont('helvetica', 'bold');
    doc.text(`Smt. Kiran S. Gaikwad`, pageWidth - margin - 30, sigY, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`HOD, ${user?.branch || 'IT'}`, pageWidth - margin - 30, sigY + 10, { align: 'center' });

    // ─── Footer Advertisement ───────────────────────────────────────────────
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(220, 220, 228);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(140, 140, 160);
    doc.text('Generated via Campus Pulse - The Official Event & Recruitment Portal', pageWidth / 2, footerY, { align: 'center' });

    // Save PDF
    const fileName = `Notice_${event.title.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};
