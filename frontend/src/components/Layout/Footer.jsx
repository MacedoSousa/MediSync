import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div>MediSync &copy; {new Date().getFullYear()} - Todos os direitos reservados.</div>
      <div><a href="/privacidade">Política de Privacidade</a></div>
    </footer>
  );
}

export default Footer;
