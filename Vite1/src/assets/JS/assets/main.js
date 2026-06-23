import '../../SCSS/style.scss'
import topButton from './_topbutton'
document.body.appendChild(topButton());


const image = document.querySelector('#art-img')
const cultureButton = document.querySelector('#culture')
const servicesButton = document.querySelector('#services')
const artText = document.querySelector('#art-text')
const descText = document.querySelector('#desc')
const artData = {
  services: {
    imgsrc: "https://www.dummyimage.com/600x400/000/fff",
    desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto, consequuntur rerum iure, pariatur, eaque eligendi quasi excepturi veritatis libero in deserunt maxime accusantium eos molestiae distinctio beatae nemo fugit alias.",
    headline: "FULL<br> TOURS,<br> NO<br> EXCUSES."
  },
  culture: {
    imgsrc: "https://www.dummyimage.com/600x400/f70df7/0011ff",
    desc: "DOREM ipsum dolor sit amet consectetur adipisicing elit. Iusto, consequuntur rerum iure, pariatur, eaque eligendi quasi excepturi veritatis libero in deserunt maxime accusantium eos molestiae distinctio beatae nemo fugit alias.",
    headline: "CREW<br> MATTERS<br> NO<br> EXCUSES."
  }
}

cultureButton.onclick = () => {
  clicked(cultureButton);
}
servicesButton.onclick = () => {
  clicked(servicesButton);
}
async function clicked(button){
  const dinamicContet = [image, artText, descText];
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  fadeout(dinamicContet);
  toggleActive(button);
  toggleTextSize(button);
  await wait(500);
  fadein(dinamicContet);
  const selected = artData[button.id];
  image.src = selected.imgsrc;
  artText.innerHTML = selected.headline;
  descText.innerHTML = selected.desc;
}
function fadeout(elements){
  for(let element of elements)
    {
      element.classList.add('is-changing');
    }
}
function fadein(elements){
  for(let element of elements)
    {
      element.classList.remove('is-changing');
    }
}

function toggleActive(button) {
  button.classList.add('active');
  if (button.id === 'culture') {
    servicesButton.classList.remove('active');
  } else {
    cultureButton.classList.remove('active');
  }
}

function toggleTextSize(button){
  button.classList.add('large-text');
  if(button.id === 'culture'){
    servicesButton.classList.remove('large-text');
  } else {
    cultureButton.classList.remove('large-text');
  }
}
