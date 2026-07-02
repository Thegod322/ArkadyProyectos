import './style.scss'

const $hamburger = document.querySelector(".navbar-toggler");
const $navcoll = document.querySelector(".navbar-collapse");
const $ctaButton = document.querySelector(".cta")
const $targetSection = document.querySelector(".target")
$hamburger.addEventListener("click",()=>{
  $navcoll.classList.toggle("collapse")
})
$ctaButton.addEventListener("click",()=>{
  $targetSection.scrollIntoView({behavior:"smooth"})
})

