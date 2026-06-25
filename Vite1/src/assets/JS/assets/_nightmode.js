export default function nightButton(){
    
    const $btnDarkMode = document.createElement("button");
    $btnDarkMode.className = "night-button";
    $btnDarkMode.innerHTML = `
    <i class="fa-solid fa-moon" aria-hidden="true"></i>
    `;
    //const $btnDarkMode = document.querySelector(".nav__container--darkModeButton");
    $btnDarkMode.addEventListener( "click" , (e)=> {
        const root = document.documentElement;
        const $icon = $btnDarkMode.querySelector(".fa-solid");
        if($icon.classList.contains("fa-moon")){
            console.log("pizdec")

            $icon.classList.remove("fa-moon");
            $icon.classList.add("fa-sun");
            // Seleccionamos el :root

            // Cambiamos el valor de la variable
            root.style.setProperty('--color00', '#000000');
            root.style.setProperty('--primary', 'blue');
        }
        else{
            console.log("zalupkaaa")

            $icon.classList.remove("fa-sun");
            $icon.classList.add("fa-moon");

        }
    } );

    return $btnDarkMode;
}