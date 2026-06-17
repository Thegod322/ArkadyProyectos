import '../../SCSS/style.scss'

const expandButton = document.querySelector('#expand')
const expandible = document.querySelector('#expandible')
const desplegable = document.querySelector('#desplegable')

//expandButton.onclick = () => {
 //   if(desplegable.classList.contains('expanded')){
  //      desplegable.classList.remove('expanded')
  ///      return
   // }
  //  desplegable.classList.add('expanded')
//}//

const expandibles = document.querySelectorAll('.expand')
expandibles.forEach((boton)=>{
    boton.addEventListener("click",(e)=>{
        const article = e.currentTarget.closest('.article')
        const desplegable = article.querySelector('.desplegable')

        expandibles.forEach((boton)=>{
            boton.style.backgroundColor="black"
            boton.style.color="white"
            boton.style.border = "1px solid transparent"
        })
        desplegable.classList.toggle('expanded')
    })
})