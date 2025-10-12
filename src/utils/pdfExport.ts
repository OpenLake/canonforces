import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportStatsToPDF(
  username1: string,
  username2: string | null,
  platform: 'codeforces' | 'leetcode'
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add title
  pdf.setFontSize(20);
  pdf.setTextColor(33, 37, 41);
  const title = username2 
    ? `${platform === 'codeforces' ? 'Codeforces' : 'LeetCode'} Comparison: ${username1} vs ${username2}`
    : `${platform === 'codeforces' ? 'Codeforces' : 'LeetCode'} Stats: ${username1}`;
  
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  pdf.setFontSize(10);
  pdf.setTextColor(108, 117, 125);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

  // Capture charts
  const chartElements = document.querySelectorAll('[data-chart]');
  let yOffset = 40;

  for (let i = 0; i < chartElements.length; i++) {
    const element = chartElements[i] as HTMLElement;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add new page if needed
      if (yOffset + imgHeight > pageHeight - 20) {
        pdf.addPage();
        yOffset = 20;
      }

      pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    } catch (error) {
      console.error('Error capturing chart:', error);
    }
  }

  // Save the PDF
  const filename = username2 
    ? `${platform}_comparison_${username1}_vs_${username2}.pdf`
    : `${platform}_stats_${username1}.pdf`;
  
  pdf.save(filename);
}

export function calculateDerivedStats(contests: any[]) {
  if (!contests || contests.length === 0) {
    return {
      avgGain: 0,
      maxGain: 0,
      minGain: 0,
      positiveContests: 0,
      negativeContests: 0,
      totalContests: 0,
    };
  }

  const gains = contests.map(c => c.gain || (c.newRating - c.oldRating) || 0);
  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const maxGain = Math.max(...gains);
  const minGain = Math.min(...gains);
  const positiveContests = gains.filter(g => g > 0).length;
  const negativeContests = gains.filter(g => g < 0).length;

  return {
    avgGain: Math.round(avgGain),
    maxGain,
    minGain,
    positiveContests,
    negativeContests,
    totalContests: contests.length,
  };
}

export function getTopTag(tags: Record<string, number> | any[]): string {
  if (Array.isArray(tags)) {
    if (tags.length === 0) return 'N/A';
    return tags[0].tagName || 'N/A';
  }
  
  if (!tags || Object.keys(tags).length === 0) return 'N/A';
  
  const entries = Object.entries(tags);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || 'N/A';
}
