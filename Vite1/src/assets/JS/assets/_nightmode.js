export default function darkmode(){
    const $btnDarkMode = document.querySelector(".nav__container--darkModeButton");
    $btnDarkMode.addEventListener( "click" , (e)=> {
        const $icon = $btnDarkMode.querySelector(".fa-solid");
        $icon.classList.remove(".fa-solid")
        $icon.classList.add("fa-sun")
    } );
}