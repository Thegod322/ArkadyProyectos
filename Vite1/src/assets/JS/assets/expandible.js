import '../../SCSS/style.scss'

const expandButton = document.querySelector('#expand')
const expandible = document.querySelector('#expandible')
const desplegable = document.querySelector('#desplegable')

expandButton.onclick = () => {
    if(desplegable.classList.contains('expanded')){
        desplegable.classList.remove('expanded')
        return
    }
    desplegable.classList.add('expanded')
}

