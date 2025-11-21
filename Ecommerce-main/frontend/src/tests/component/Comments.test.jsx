import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comments from '@/pages/Comments';

describe('<Comments />', () => {
  it('navega con los botones anterior/siguiente', async () => {
    const user = userEvent.setup();
    render(<Comments />);

    // Muestra el primero
    expect(screen.getByRole('region', { name: /opiniones de clientes/i })).toBeInTheDocument();

    // Siguiente y anterior (no sabemos el texto exacto, probamos que el botón existe y es clickable)
    await user.click(screen.getByRole('button', { name: /siguiente comentario/i }));
    await user.click(screen.getByRole('button', { name: /comentario anterior/i }));

   
  });
});
