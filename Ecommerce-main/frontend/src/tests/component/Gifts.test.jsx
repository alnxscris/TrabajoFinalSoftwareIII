import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock de SECTIONS y ProductCard para garantizar render
jest.mock('@/services/products', () => ({
  SECTIONS: [
    { title: 'Recomendados', items: [{ id: '1', title: 'Box Gold', price: 99, image: '/i.jpg' }] }
  ]
}));

jest.mock('@/components/ui/ProductCard', () => ({ product, onDetails }) => (
  <button onClick={() => onDetails(product)} aria-label={`Abrir ${product.title}`}>
    {product.title}
  </button>
));

import Gifts from '@/pages/Gifts';

describe('<Gifts />', () => {
  it('renderiza secciones y abre/cierra modal de detalles', async () => {
    const user = userEvent.setup();
    render(<Gifts />);

    expect(screen.getByRole('heading', { name: /recomendados/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /abrir box gold/i }));
    // Modal visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Cerrar
    await user.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
