function artSlider() {
  const $carrousel = document.querySelectorAll(".artSlider01");

  $carrousel.forEach(($el) => {
    const $pista = $el.querySelector(".artSlider01__pista");
    const $dots = $el.querySelectorAll(".artSlider01__track__dot");
    const $slides = $pista.querySelectorAll(".artSlider01__slide");
    // Comprobar que nuestra pista y los slider existan dentro del DOM
    if (!$pista || $slides.length === 0) return;

    // contador guarda en que slide estamos.
    // Empieza en 0 porque la primera slide es la posicion inicial.
    let contador = 0;

    // Estos tiempos estan separados para que sea facil cambiarlos en clase.
    const tiempoTransicion = 500;
    const tiempoEspera = 3000;

    $slides.forEach(($slide) => {
      const $copia = $slide.cloneNode(true);
      $pista.appendChild($copia);
    });

    // El setInterval se ejecutará cada 3000 milisegundos - tiempoEspera
    setInterval(() => {
      contador++;
      console.log(contador);
      $pista.style.transition = `transform ${tiempoTransicion}ms`;
      $pista.style.transform = `translateX(-${100 * contador}%)`;
      //Actual elemento dot "activo"
      $dots[contador - 1]?.classList.remove("active");

      // Siguiente elemento dot
      if ($dots[contador]) {
        // Comprobamos que nuestro dot no contenga la clase "active"
        if (!$dots[contador].classList.contains("active")) {
          $dots[contador].classList.add("active");
        }
      } else {
        $dots[0].classList.add("active");
      }

      // Hay que validar el contador se igual al número de la última posición de slides
      if (contador === $slides.length) {
        setTimeout(() => {
          // Reiniciar la posición del visor para mostrar el primer slide
          $pista.style.transition = "none";
          $pista.style.transform = `translateX(0)`;
          contador = 0;
        }, tiempoTransicion);
      }
    }, tiempoEspera);

    //
    /* setTimeout(() => {
      console.log(`Me ejecuto cada ${tiempoEspera}s`);
    }, tiempoEspera); */
  });
}

artSlider();
export default artSlider;