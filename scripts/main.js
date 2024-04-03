let fse = document.querySelector('#fse');
let equipment = document.querySelector('#equipment');
let serial = document.querySelector('#sn');
let date = document.querySelector('#date');
let form = document.querySelector('#form')
let entradas = document.querySelector('#entry');
let comment = document.querySelector('#text');
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
    console.log("URL IMAGEN " + urls);
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
      
      urls[i] = URL.createObjectURL(image);
      i++;
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
  doc.text(20,40,'Comentario: ' + comment.value);

  const img1 = new Image();
  img1.src = urls[0];
  const img2 = new Image();
  img2.src = urls[1];
  const img3 = new Image();
  img3.src = urls[2];
  const img4 = new Image();
  img4.src = urls[3];
  const img5 = new Image();
  img5.src = urls[4];
  const img6 = new Image();
  img6.src = urls[5];

  img1.onload = () => {
    img2.onload = () => {
      img3.onload = () => {
        img4.onload = () => {
          img5.onload = () => {
            img6.onload = () => {
              console.log("Imagen cargada");
              doc.addImage(img1, 'jpg',20,45,75,75);
              doc.addImage(img2, 'jpg',20,130,75,75);
              doc.addImage(img3, 'jpg',120,45,75,75);
              doc.addImage(img4, 'jpg',120,130,75,75);
              doc.addImage(img5, 'jpg',20,215,75,75);
              doc.addImage(img6, 'jpg',120,215,75,75);
              doc.save('reporte-fotografico.pdf');
            }
          }
        }
      }
    }
  }
  
 
  // const img = new Image();
  //   img.src = urls[0];
  //   console.log(urls[0]);
  //   img.onload = () => {
  //     doc.addImage(img,'png',20,45,65,65);
  //     doc.save('reporte-fotografico.pdf');
  // }

}