// Carrusel accesible (auto-slide + dots)
import { useEffect, useRef, useState } from 'react'


const images = ['/images/imagen1.jpg', '/images/imagen2.jpg', '/images/imagen3.jpg']


const Carousel = ({ interval = 4000 }) => {
const [index, setIndex] = useState(0)
const timerRef = useRef(null)


useEffect(() => {
timerRef.current = setInterval(() => {
setIndex(prev => (prev + 1) % images.length)
}, interval)
return () => clearInterval(timerRef.current)
}, [interval])


return (
<div className="carousel" role="region" aria-label="Galería de destacados">
{images.map((src, i) => (
<img
key={src}
src={src}
alt={`Slide ${i + 1}`}
className={`carousel__slide ${i === index ? 'is-active' : ''}`}
draggable={false}
/>
))}
<div className="carousel__dots">
{images.map((_, i) => (
<button
key={i}
aria-label={`Ir al slide ${i + 1}`}
className={`dot ${i === index ? 'dot--active' : ''}`}
onClick={() => setIndex(i)}
/>
))}
</div>
</div>
)
}


export default Carousel