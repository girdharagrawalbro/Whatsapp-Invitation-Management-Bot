const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { uploadMedia } = require('./mediaHandler');

// Convert font file to base64
const fontPath = path.join(__dirname, '../fonts/NotoSansDevanagari-Regular.ttf');
const fontBase64 = fs.readFileSync(fontPath, 'base64');

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browserInstance;
}

async function generatePdf(events, today = true, organization = null) {
  const todayDate = new Date().toLocaleDateString('hi-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  // Default values if no organization provided
  const orgName = organization?.name || 'माननीय श्री अमर बंसल जी';
  const orgWard = organization?.ward || '[वार्ड नंबर]';
  const orgZone = organization?.zone || '[जोन नंबर]';
  const orgContact = organization?.contactInfo || '+91-XXXXXXXXXX';
  const orgEmail = organization?.email || 'amarbansal@example.com';

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.eventDate);
    const dateB = new Date(b.eventDate);
    if (dateA - dateB !== 0) return dateA - dateB;
    return (a.eventTime || '').localeCompare(b.eventTime || '');
  });

  const eventRows = sortedEvents.map(e => `
    <tr>
      ${today
      ? `<td style="text-align:center;">${e.eventTime || ''}</td>`
      : `<td style="text-align:center;">${new Date(e.eventDate).toLocaleDateString('hi-IN')} ${e.eventTime || ''}</td>`}
      <td style="text-align:center;">${e.title}</td>
      <td>${e.description}</td>
      <td>${e.hostName || ''}</td>
      <td style="text-align:center;">${e.contactPhone || 'उपलब्ध नहीं'}</td>
      <td>${e.venue?.address || e.address || ''}</td>
      <td style="text-align:center;">${e.mediaUrl ? `<a href="${e.mediaUrl}" target="_blank">कार्ड</a>` : ''}</td>
    </tr>
  `).join('');

  const html = `
  <html lang="hi">
    <head>
      <meta charset="utf-8" />
      <style>
        @font-face {
          font-family: 'Noto Sans Devanagari';
          src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
        }

        body, * {
          font-family: 'Noto Sans Devanagari', sans-serif;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          border: 1px solid #ccc;
          padding: 5px;
          font-size: 13px;
        }

        .header {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${orgName}<br>
        पार्षद, समता कॉलोनी रायपुर, छत्तीसगढ़<br>
        वार्ड क्रमांक: ${orgWard}, जोन: ${orgZone}<br>
        ${today ? `कार्यक्रम सूची - ${todayDate}` : 'कार्यक्रम सूची'}
      </div>

      <table>
        <thead>
          <tr>
            ${today ? '<th>समय</th>' : '<th>तारीख समय</th>'}
            <th>कार्यक्रम</th>
            <th>विवरण</th>
            <th>आयोजक</th>
            <th>फोन</th>
            <th>स्थान</th>
            <th>कार्ड</th>
          </tr>
        </thead>
        <tbody>
          ${eventRows}
        </tbody>
      </table>

      <div class="footer">
        संपर्क: ${orgContact} | ईमेल: ${orgEmail}<br>
        यह एक स्वचालित रूप से जनरेट की गई सूची है
      </div>
    </body>
  </html>
  `;

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await page.close();

    // Save to temp file and upload to Cloudinary
    const tempFilePath = path.join(__dirname, `../temp/report-${Date.now()}.pdf`);
    if (!fs.existsSync(path.join(__dirname, '../temp'))) fs.mkdirSync(path.join(__dirname, '../temp'));
    
    fs.writeFileSync(tempFilePath, pdfBuffer);
    const longUrl = await uploadMedia(tempFilePath);
    
    // Cleanup
    fs.unlinkSync(tempFilePath);

    return { longUrl, pdfBuffer };
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
}

module.exports = { generatePdf };
