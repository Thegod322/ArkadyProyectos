export default function topButton(){
    const $btnTop = document.createElement("button");
    $btnTop.className = "fab-button";
    $btnTop.innerHTML = `
    <i class="fa-solid fa-arrow-up"></i>
    `;
    
    
    window.addEventListener("scroll", () => {

        
        const totalHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = totalHeight - windowHeight;
        const scrollPercentage = (window.scrollY / maxScroll) * 100;
        
        if(scrollPercentage > 10){
            $btnTop.style.display = "block"
        }
        else{
            $btnTop.style.display = "none"
        }
        
    })
    
    $btnTop.addEventListener ("click",()=>{
        window.scrollTo({top: 0, behavior : "smooth"})
    })
    
    return $btnTop; 
}

