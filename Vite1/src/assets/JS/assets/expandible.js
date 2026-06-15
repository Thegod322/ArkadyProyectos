import '../../SCSS/style.scss'

const expandButton = document.querySelector('#expand')
const expandible = document.querySelector('#expandible')

if (expandButton && expandible) {
    const getCollapsedHeight = () => {
        const sampleLine = expandible.cloneNode(false)

        sampleLine.textContent = 'Ag'
        sampleLine.classList.remove('expanded')
        sampleLine.style.position = 'absolute'
        sampleLine.style.visibility = 'hidden'
        sampleLine.style.pointerEvents = 'none'
        sampleLine.style.maxHeight = 'none'
        sampleLine.style.height = 'auto'
        sampleLine.style.whiteSpace = 'nowrap'

        document.body.append(sampleLine)
        const collapsedHeight = Math.ceil(sampleLine.getBoundingClientRect().height)
        sampleLine.remove()

        return `${collapsedHeight}px`
    }

    const collapseExpandible = () => {
        expandible.classList.remove('expanded')
        expandible.style.maxHeight = getCollapsedHeight()
    }

    const expandExpandible = () => {
        expandible.classList.add('expanded')
        expandible.style.maxHeight = `${expandible.scrollHeight}px`
    }

    collapseExpandible()

    expandButton.onclick = () => {
        if (expandible.classList.contains('expanded')) {
            collapseExpandible()
            return
        }

        expandExpandible()
    }

    window.addEventListener('resize', () => {
        if (expandible.classList.contains('expanded')) {
            expandExpandible()
            return
        }

        collapseExpandible()
    })
}