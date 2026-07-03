document.addEventListener("click", (e) => {
  // e.target es el elemento exacto donde hiciste clic.
  // .matches() comprueba si ese elemento tiene la clase que buscas.
  
  if (e.target.matches(".btn-exp")) {
    console.log("Hiciste clic en uno de los botones");
    // Busca el contenedor de la tarjeta más cercano
    const $tarjeta = e.target.closest('.card');
    // Dentro de esa tarjeta, busca el div colapsable
    const $hiddentext = $tarjeta.querySelector('.colapsable');
    console.log($hiddentext);
    // Alterna la clase open si el elemento existe
    if($hiddentext && $hiddentext.classList.contains("colapsable")){
        $hiddentext.classList.toggle("open");
    }
  }
});