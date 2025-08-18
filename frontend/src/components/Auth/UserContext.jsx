import React, { createContext, useState } from 'react';

// Tipos possíveis: admin, paciente, clinica, hospital, farmacia, medico
export const UserContext = createContext({
  userType: 'paciente',
  user: null,
  setUserType: () => {},
  setUser: () => {},
});

export function UserProvider({ children }) {
  const [userType, setUserType] = useState('paciente');
  const [user, setUser] = useState(null);

  // Função utilitária para checar permissão
  const hasRole = (roles) => Array.isArray(roles) ? roles.includes(userType) : userType === roles;

  return (
    <UserContext.Provider value={{ userType, setUserType, user, setUser, hasRole }}>
      {children}
    </UserContext.Provider>
  );
}
