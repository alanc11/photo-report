let fse = document.querySelector('#fse');
let equipment = document.querySelector('#equipment');
let serial = document.querySelector('#sn');
let date = document.querySelector('#date');
let form = document.querySelector('#form')
let entradas = document.querySelector('#entry');

const output = document.querySelector("output")
const input = document.querySelector("#photos")
let imagesArray = []

let urls = [];
form.addEventListener('submit', onClick);

function onClick(event){
    console.log(event);
    event.preventDefault();
    // console.log(fse.value);
    // console.log(equipment.value);
    // console.log(serial.value);
    // console.log(date.value);
    entradas.innerText = fse.value + " - " + equipment.value + " - " + serial.value + " - " + date.value; 
}

input.addEventListener("change", () => {
    const files = input.files
    for (let i = 0; i < files.length; i++) {
        imagesArray.push(files[i])
        //console.log(files[i]);
      }
      displayImages()
      
})

function displayImages() {
  let i = 0;
  let images = ""
  imagesArray.forEach((image, index) => {
      images += `<div class="image">
              <img src="${URL.createObjectURL(image)}" alt="image">
              <span onclick="deleteImage(${index})">&times;</span>
            </div>`
      i++;
      urls[i] = URL.createObjectURL(image);
      //console.log(urls);
      //console.log(i);  
  })
  output.innerHTML = images
}

function deleteImage(index) {
  imagesArray.splice(index, 1)
  displayImages()
}

function genPDF(event){
  event.preventDefault();
  let doc = new jsPDF();
  doc.setFontSize(10);
  doc.text(20,20,'FSE: ' + fse.value);
  doc.text(20,25,'Equipo: ' + equipment.value);
  doc.text(20,30,'Número de serie: ' + serial.value);
  doc.text(20,35,'Fecha: ' + date.value);

  const img = new Image();
    img.src = urls[0];
    console.log(urls[0]);
    img.onload = () => {
      doc.addImage(img,'png',20,45,65,65);
      doc.save('reporte-fotografico.pdf');
  }

}