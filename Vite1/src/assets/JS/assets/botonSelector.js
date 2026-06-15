const botones = document.querySelectorAll('.boton')
botones.forEach((boton)=>{
    boton.addEventListener("click",(e)=>{

        botones.forEach((boton)=>{
            boton.style.backgroundColor="black"
            boton.style.color="white"
            boton.style.border = "1px solid transparent"
        })
        e.currentTarget.style.backgroundColor="white"
        e.currentTarget.style.color = "black"
        e.currentTarget.style.border = "1px solid black"
    })
})