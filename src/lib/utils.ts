import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RefObject } from 'react';

// CORRECTED THE TYPE OF THE PARAMETER TO ALLOW FOR NULL
export const exportComparisonAsPDF = (elementRef: RefObject<HTMLElement | null>) => {
  const input = elementRef.current;
  if (!input) {
    console.error("Element to export not found!");
    return;
  }

  // Add a background color to the canvas to avoid transparent PDFs
  html2canvas(input, { scale: 2, backgroundColor: '#f8f9fa' })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add a small margin
      const margin = 5;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      pdf.save(`comparison-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    })
    .catch(err => {
      console.error("Could not generate PDF", err);
    });
};

export const getAverageGain = (contests: any[]): number => {
    if (!contests || contests.length === 0) return 0;
    const totalGain = contests.reduce((acc, c) => acc + (c.gain || 0), 0);
    return Math.round(totalGain / contests.length);
};

export const getTopTag = (tags: Record<string, number>): { name: string, count: number } => {
    if (!tags || Object.keys(tags).length === 0) return { name: 'N/A', count: 0 };
    const topTag = Object.entries(tags).sort(([, a], [, b]) => b - a)[0];
    return { name: topTag[0], count: topTag[1] };
};