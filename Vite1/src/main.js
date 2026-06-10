import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

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
  image.src = artData.culture.imgsrc;
  artText.innerHTML = artData.culture.headline;
  descText.innerHTML = artData.culture.desc;
  toggleActive(cultureButton);
  toggleTextSize(cultureButton);
}
servicesButton.onclick = () => {
  image.src = artData.services.imgsrc;
  artText.innerHTML = artData.services.headline;
  descText.innerHTML = artData.services.desc;
  toggleActive(servicesButton);
  toggleTextSize(servicesButton);
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
