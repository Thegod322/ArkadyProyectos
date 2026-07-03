document.addEventListener("click", (e) => {
  // e.target es el elemento exacto donde hiciste clic.
  // .matches() comprueba si ese elemento tiene la clase que buscas.
  
  if (e.target.matches(".btn-exp")) {
    console.log("Hiciste clic en uno de los botones");
    const $tarjeta = e.target.closest('.card');
    const $hiddentext = $tarjeta.querySelector('.colapsable');
    console.log($hiddentext)
    if($hiddentext && $hiddentext.classList.contains("colapsable")){
        $hiddentext.classList.toggle("open");
    }
  }
});