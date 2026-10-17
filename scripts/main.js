// Referencias del DOM
const fseInput = document.querySelector('#fse');
const equipmentInput = document.querySelector('#equipment');
const serialInput = document.querySelector('#sn');
const dateInput = document.querySelector('#date');
const commentInput = document.querySelector('#text');
const photosInput = document.querySelector('#photos');
const output = document.querySelector('output');
const btnPdf = document.querySelector('#btn-pdf');

let imagesArray = [];

// 1. Inicialización: Carga nombre previo y coloca la fecha actual
document.addEventListener('DOMContentLoaded', () => {
  const savedFSE = localStorage.getItem('fse_name');
  if (savedFSE && fseInput) fseInput.value = savedFSE;

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
});

// Guardar nombre FSE automáticamente cuando cambie
fseInput.addEventListener('change', () => {
  localStorage.setItem('fse_name', fseInput.value.trim());
});

// 2. Manejo de fotografías seleccionadas
photosInput.addEventListener('change', () => {
  const files = Array.from(photosInput.files);
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      imagesArray.push(file);
    }
  });
  photosInput.value = ''; // Permite volver a seleccionar el mismo archivo si es necesario
  renderGallery();
});

// 3. Renderizado de miniaturas con botón de eliminación
function renderGallery() {
  output.innerHTML = '';
  imagesArray.forEach((file, index) => {
    const objectUrl = URL.createObjectURL(file);

    const card = document.createElement('div');
    card.className = 'image';

    const img = document.createElement('img');
    img.src = objectUrl;
    img.onload = () => URL.revokeObjectURL(objectUrl); // Libera memoria RAM

    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Eliminar foto';
    closeBtn.onclick = () => deleteImage(index);

    card.appendChild(img);
    card.appendChild(closeBtn);
    output.appendChild(card);
  });
}

function deleteImage(index) {
  imagesArray.splice(index, 1);
  renderGallery();
}

// 4. Compresión y redimensionado de imágenes vía Canvas
function processImage(file, maxDimension = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// 5. Carga opcional de logotipo corporativo
function loadLogo(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve({
        dataUrl: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => resolve(null);
  });
}

// 6. Generador de PDF dinámico (1 a N fotos con paginación automática)
async function genPDF(event) {
  if (event) event.preventDefault();

  if (!fseInput.value || !equipmentInput.value || !serialInput.value) {
    alert('Por favor completa al menos los campos FSE, Equipo y Número de Serie.');
    return;
  }

  const originalText = btnPdf.innerText;
  btnPdf.innerText = 'GENERANDO PDF...';
  btnPdf.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();   // 210 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
    const margin = 15;

    // Logotipo
    const logoData = await loadLogo('./assets/logo.png');
    if (logoData) {
      const logoTargetWidth = 22; // Ancho deseado en mm
      // Calcula el alto proporcional exacto según la imagen original
      const logoTargetHeight = (logoData.height * logoTargetWidth) / logoData.width;
      
      const xLogo = pageWidth - margin - logoTargetWidth;
      const yLogo = 12;

      doc.addImage(logoData.dataUrl, 'PNG', xLogo, yLogo, logoTargetWidth, logoTargetHeight);
    }

    // Cabecera de datos
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE FOTOGRÁFICO DE SERVICIO', margin, 18);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`FSE: ${fseInput.value.trim()}`, margin, 26);
    doc.text(`Equipo: ${equipmentInput.value.trim()}`, margin, 31);
    doc.text(`Número de serie: ${serialInput.value.trim()}`, margin, 36);
    doc.text(`Fecha: ${dateInput.value}`, margin, 41);

    let yPos = 46;
    if (commentInput.value.trim()) {
      const splitComment = doc.splitTextToSize(`Comentario: ${commentInput.value.trim()}`, pageWidth - (margin * 2));
      doc.text(splitComment, margin, yPos);
      yPos += (splitComment.length * 4) + 4;
    } else {
      yPos += 2;
    }

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    // Procesar imágenes en paralelo
    const processedImages = await Promise.all(
      imagesArray.map(file => processImage(file))
    );

    // Cuadrícula de 2 columnas
    const colWidth = (pageWidth - (margin * 2) - 8) / 2; // ~86 mm
    const imgHeight = 65; // Alto uniforme
    let col = 0;

    for (let i = 0; i < processedImages.length; i++) {
      // Salto de página si la foto rebasa la hoja
      if (yPos + imgHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        col = 0;
      }

      const xPos = margin + (col * (colWidth + 8));
      doc.addImage(processedImages[i], 'JPEG', xPos, yPos, colWidth, imgHeight, undefined, 'FAST');

      if (col === 0) {
        col = 1;
      } else {
        col = 0;
        yPos += imgHeight + 6;
      }
    }

    // Nombre de archivo normalizado
    const cleanSerial = serialInput.value.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanEquip = equipmentInput.value.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    doc.save(`Reporte_${cleanEquip}_${cleanSerial}_${dateInput.value}.pdf`);

  } catch (error) {
    console.error('Error generando el PDF:', error);
    alert('Ocurrió un error al generar el PDF. Revisa la consola.');
  } finally {
    btnPdf.innerText = originalText;
    btnPdf.disabled = false;
  }
}