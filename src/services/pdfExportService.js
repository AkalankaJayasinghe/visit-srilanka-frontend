import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

// Function to generate PDF from a specific DOM element
export const generatePDF = async (elementId, fileName) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return false;
  }

  try {
    // Create a clone of the element to modify for PDF without affecting the UI
    const clone = element.cloneNode(true);
    clone.style.width = '800px';
    clone.style.padding = '20px';
    clone.style.backgroundColor = '#fff';
    
    // Temporarily append clone to body but make it invisible
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    
    // Create header with current date and time
    const headerDiv = document.createElement('div');
    headerDiv.style.textAlign = 'right';
    headerDiv.style.color = '#666';
    headerDiv.style.fontSize = '10px';
    headerDiv.style.marginBottom = '15px';
    headerDiv.innerHTML = `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
    clone.insertBefore(headerDiv, clone.firstChild);
    
    // Add a title at the top
    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.fontSize = '22px';
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '20px';
    titleDiv.innerHTML = 'Trip Plan Details';
    clone.insertBefore(titleDiv, headerDiv.nextSibling);
    
    // Remove any button elements in the clone
    const buttons = clone.querySelectorAll('button, .btn, .navbar, .footer, .header-actions');
    buttons.forEach(button => {
      button.remove();
    });
    
    // Remove any links that are buttons
    const actionLinks = clone.querySelectorAll('a.btn, .view-btn');
    actionLinks.forEach(link => {
      link.remove();
    });
    
    // Add page number footer
    const footerDiv = document.createElement('div');
    footerDiv.style.textAlign = 'center';
    footerDiv.style.color = '#666';
    footerDiv.style.fontSize = '10px';
    footerDiv.style.marginTop = '15px';
    footerDiv.innerHTML = 'Page 1';
    clone.appendChild(footerDiv);
    
    // Generate canvas from the clone
    const canvas = await html2canvas(clone, {
      scale: 1.5, // Higher quality
      useCORS: true, // Enable cross-origin images
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Remove the clone from DOM
    document.body.removeChild(clone);
    
    // Generate PDF from canvas
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add image to first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if content is too long
    let pageNum = 1;
    while (heightLeft > 0) {
      pageNum++;
      position = -pageHeight * pageNum;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(fileName || 'trip-plan.pdf');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Function to generate a simpler, better formatted PDF
export const generateTripPlanPDF = (tripPlan, fileName) => {
  if (!tripPlan) {
    console.error('No trip plan data provided');
    return false;
  }
  
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add some styling
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;
    
    // Helper function to add text with line wrapping
    const addWrappedText = (text, x, y, maxWidth, lineHeight = 7) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * lineHeight);
    };
    
    // Add title
    pdf.setFontSize(22);
    pdf.setTextColor(25, 25, 112); // Dark blue
    pdf.text(tripPlan.name, pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Add date information
    pdf.setFontSize(12);
    pdf.setTextColor(70, 70, 70);
    const startDateFormatted = format(new Date(tripPlan.startDate), 'MMMM d, yyyy');
    const endDateFormatted = format(new Date(tripPlan.endDate), 'MMMM d, yyyy');
    const duration = Math.ceil((new Date(tripPlan.endDate) - new Date(tripPlan.startDate)) / (1000 * 60 * 60 * 24));
    
    pdf.text(`Trip Duration: ${startDateFormatted} to ${endDateFormatted} (${duration} days)`, pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // Hotels section
    if (tripPlan.hotels && tripPlan.hotels.length > 0) {
      pdf.setFontSize(16);
      pdf.setTextColor(40, 79, 77); // Teal
      pdf.text('Hotels', margin, y);
      y += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      tripPlan.hotels.forEach(hotel => {
        const hotelName = hotel.hotelId?.name || 'Hotel';
        const checkIn = format(new Date(hotel.checkIn), 'MMM d, yyyy');
        const checkOut = format(new Date(hotel.checkOut), 'MMM d, yyyy');
        const location = hotel.hotelId?.location ? 
          (typeof hotel.hotelId.location === 'string' ? hotel.hotelId.location : 
            (hotel.hotelId.location.address || hotel.hotelId.location.city || 'Location not available')) 
          : 'Location not available';
        
        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        y = addWrappedText(hotelName, margin, y, pageWidth - (margin * 2));
        
        pdf.setFontSize(11);
        pdf.setTextColor(90, 90, 90);
        y = addWrappedText(`Location: ${location}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        y = addWrappedText(`Check-in: ${checkIn} | Check-out: ${checkOut}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        y += 8;
      });
      
      y += 5;
    }
    
    // Check if we need a new page
    if (y > pageHeight - 50) {
      pdf.addPage();
      y = margin;
    }
    
    // Restaurants section
    if (tripPlan.restaurants && tripPlan.restaurants.length > 0) {
      pdf.setFontSize(16);
      pdf.setTextColor(192, 86, 33); // Orange
      pdf.text('Restaurants', margin, y);
      y += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      tripPlan.restaurants.forEach(restaurant => {
        const restaurantName = restaurant.restaurantId?.name || 'Restaurant';
        const date = format(new Date(restaurant.date), 'MMM d, yyyy');
        const time = restaurant.time;
        const formattedTime = time ? formatTime(time) : '';
        const location = restaurant.restaurantId?.location ? 
          (typeof restaurant.restaurantId.location === 'string' ? restaurant.restaurantId.location : 
            (restaurant.restaurantId.location.address || restaurant.restaurantId.location.city || 'Location not available')) 
          : 'Location not available';
        
        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        y = addWrappedText(restaurantName, margin, y, pageWidth - (margin * 2));
        
        pdf.setFontSize(11);
        pdf.setTextColor(90, 90, 90);
        y = addWrappedText(`Location: ${location}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        y = addWrappedText(`Date: ${date} at ${formattedTime}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        y += 8;
        
        // Check if we need a new page
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = margin;
        }
      });
      
      y += 5;
    }
    
    // Check if we need a new page
    if (y > pageHeight - 50) {
      pdf.addPage();
      y = margin;
    }
    
    // Transportation section
    if (tripPlan.cabServices && tripPlan.cabServices.length > 0) {
      pdf.setFontSize(16);
      pdf.setTextColor(107, 70, 193); // Purple
      pdf.text('Transportation', margin, y);
      y += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      tripPlan.cabServices.forEach(cab => {
        const cabName = cab.cabServiceId?.name || 'Cab Service';
        const date = format(new Date(cab.date), 'MMM d, yyyy');
        
        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        y = addWrappedText(cabName, margin, y, pageWidth - (margin * 2));
        
        pdf.setFontSize(11);
        pdf.setTextColor(90, 90, 90);
        y = addWrappedText(`Date: ${date}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        if (cab.pickup && cab.dropoff) {
          y = addWrappedText(`Route: ${cab.pickup} to ${cab.dropoff}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        }
        y += 8;
        
        // Check if we need a new page
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = margin;
        }
      });
      
      y += 5;
    }
    
    // Check if we need a new page
    if (y > pageHeight - 50) {
      pdf.addPage();
      y = margin;
    }
    
    // Guides section
    if (tripPlan.guides && tripPlan.guides.length > 0) {
      pdf.setFontSize(16);
      pdf.setTextColor(214, 158, 46); // Gold
      pdf.text('Tour Guides', margin, y);
      y += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      tripPlan.guides.forEach(guide => {
        const guideName = guide.guideId?.name || 'Tour Guide';
        const startDate = format(new Date(guide.startDate), 'MMM d, yyyy');
        const endDate = format(new Date(guide.endDate), 'MMM d, yyyy');
        
        pdf.setFontSize(13);
        pdf.setTextColor(0, 0, 0);
        y = addWrappedText(guideName, margin, y, pageWidth - (margin * 2));
        
        pdf.setFontSize(11);
        pdf.setTextColor(90, 90, 90);
        y = addWrappedText(`Duration: ${startDate} to ${endDate}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        
        if (guide.guideId?.languages) {
          const languages = Array.isArray(guide.guideId.languages) ? 
            guide.guideId.languages.join(', ') : guide.guideId.languages;
          y = addWrappedText(`Languages: ${languages}`, margin + 5, y + 2, pageWidth - (margin * 2) - 5);
        }
        
        y += 8;
        
        // Check if we need a new page
        if (y > pageHeight - 50) {
          pdf.addPage();
          y = margin;
        }
      });
    }
    
    // Add footer with generation info
    const currentDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated: ${currentDate}`, margin, pageHeight - 10);
    pdf.text('Sri Lanka Tourism Trip Planner', pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Save the PDF
    pdf.save(fileName || 'trip-plan.pdf');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const amPm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${amPm}`;
};

export default {
  generatePDF,
  generateTripPlanPDF
};