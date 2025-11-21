// Pequeños átomos (Button genérico) para consistencia.
// Botón reutilizable (link o button)
const Button = ({ as: Tag = 'button', children, className = '', ...props }) => (
<Tag className={`btn ${className}`} {...props}>{children}</Tag>
)


export default Button