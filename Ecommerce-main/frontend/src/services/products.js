/*/ src/services/products.js
//obsoleto: ahora que se utiliza la bd
//solo faltan registrar los productos en la bd

export const SECTIONS = [
  {
    title: "Feliz Día de la Madre",
    items: [
      { title: "Box Feliz Día Mamá con Flores", price: 129, image: "/images/imagen7.jpg",  descripcion: "Un hermoso desayuno artesanal con un toque floral, ideal para expresar amor y ternura. Incluye jugo natural, postres, taza personalizada, flores frescas y dulces detalles que harán sonreír a mamá." },
      { title: "Box Desayuno Dulce Amor",       price: 119, image: "/images/imagen8.jpg",  descripcion: "Un box delicado y elegante con jugo natural, pastel, croissant, chocolate, y detalles dulces. Perfecto para comenzar el día celebrando a quien más quieres con el sabor y estilo de MiAri Detalles." },
      { title: "Box Momento Natural Rosa",           price: 139, image: "/images/imagen9.jpg",  descripcion: "Una propuesta encantadora con productos frescos y naturales: flores, dulces artesanales, jugo natural y un delicioso croissant. Ideal para regalar bienestar y cariño en una mañana especial." },
      { title: "Box Desayuno Premium Mamá",     price: 169, image: "/images/imagen10.jpg", descripcion: "Un desayuno completo y sofisticado con flores, bebidas, bocadillos y golosinas. Presentado en una bandeja decorativa con detalles en rosa pastel que transmiten amor y gratitud." },
      { title: "Box Amor y Café Domingo",               price: 119, image: "/images/imagen11.jpg", descripcion: "Un box clásico y reconfortante con jugo natural, pan artesanal, café, infusiones y dulces. El regalo perfecto para quienes disfrutan un momento de calma con una sonrisa y una taza caliente." },
    ],
  },
  {
    title: "Feliz Día del Padre",
    items: [
      { title: "Box Gourmet para Papá",        price: 129, image: "/images/imagen2.jpg",  descripcion: "Una opción elegante para los padres que disfrutan del buen gusto. Incluye vino Intipalka, embutidos finos, crocantes de hierbas y chocolates, todo presentado con un lazo de lujo. Ideal para celebrar con estilo y sabor." },
      { title: "Box Cumpleaños Feliz Papá",    price: 99,  image: "/images/imagen4.jpg",  descripcion: "Un box lleno de energía y cariño. Contiene jugo natural, café, galletas y un detalle decorativo con mensaje personalizado. Perfecto para sorprender a papá en su día especial con un desayuno lleno de amor." },
      { title: "Box Snack para el Mejor Papá", price: 99,  image: "/images/imagen5.jpg",  descripcion: "Diseñado para los papás que disfrutan los pequeños placeres: papas artesanales, cerveza artesanal, copa personalizada y un toque dulce. Una experiencia deliciosa y práctica para celebrar juntos." },
      { title: "Box Desayuno Papá Clásico",    price: 139, image: "/images/imagen6.jpg",  descripcion: "Un box con diseño elegante en tonos blanco y negro que incluye café, jugo natural, pan con chicharrón, tamal y dulces artesanales. Ideal para compartir un momento único con papá y decirle cuánto lo aprecias." },
      { title: "Box Papá Especial Criollo",            price: 139, image: "/images/imagen12.jpg", descripcion: "El detalle perfecto para demostrar amor y gratitud. Incluye jugo natural, pan con chicharrón, postres y snacks premium, presentados en una bandeja decorativa con estilo clásico y acogedor." },
    ],
  },
  {
    title: "Otros regalos",
    items: [
      { title: "Box Cumpleaños Rosa",              price: 35, image: "/images/imagen13.jpg", descripcion: "Un detalle lleno de dulzura y color para celebrar un nuevo año de vida. Incluye flores frescas, jugo natural, cupcakes, y dulces artesanales, acompañado de un globo en forma de corazón que transmite amor y alegría." },
      { title: "Box Feliz Cumpleaños Dorado",      price: 42, image: "/images/imagen14.jpg", descripcion: "Un regalo elegante para un cumpleaños especial. Contiene vino espumante, dulces, flores naturales y detalles personalizados en tonos dorados y rosados, ideales para sorprender y celebrar con estilo." },
      { title: "Box Brindis Rosa",                 price: 38, image: "/images/imagen15.jpg", descripcion: "Diseñado para celebrar con encanto. Incluye bebida espumante, limonada rosada, copa personalizada, chocolates y una vela aromática. Perfecto para brindar por los buenos momentos con un toque femenino y sofisticado." },
      { title: "Box Cumpleaños Encantador",        price: 45, image: "/images/imagen16.jpg", descripcion: "Un desayuno artesanal con flores intensas, taza personalizada, café y postres dulces. Una presentación delicada que refleja amor y dedicación en cada detalle, ideal para empezar el día de cumpleaños con una sonrisa." },
      { title: "Box Dulce Cumpleaños con Baileys", price: 30, image: "/images/imagen17.jpg", descripcion: "Una propuesta elegante y deliciosa. Incluye licor Baileys, flores frescas, frascos de postres artesanales y chocolates. El obsequio ideal para celebrar con un toque adulto, sofisticado y dulce." },
      { title: "Box Birthday Premium",             price: 30, image: "/images/imagen18.jpg", descripcion: "Un box exclusivo con espumante, copa grabada, galletas, dulces y suculenta natural. Presentado con lazos y detalles en rosa pastel, combina elegancia y cariño en un regalo que encantará a cualquier cumpleañera." },
    ],
  },
];

// ---------- Helpers para detalle ----------
const slugify = (s) => s.toLowerCase().trim().replace(/\s+/g, "-");

// Aplana y normaliza: agrega id/slug y 'description'
export const ALL_PRODUCTS = SECTIONS.flatMap(({ items }) =>
  items.map((p) => ({
    ...p,
    id: slugify(p.title),
    slug: slugify(p.title),
    description: p.descripcion ?? p.description,
  }))
);

// Busca por id/slug (se usa en /regalos/:id)
export function getProduct(idOrSlug) {
  const key = slugify(idOrSlug || "");
  return ALL_PRODUCTS.find((p) => p.id === key || p.slug === key) || null;
}*/
