// src/AdminPage.tsx
import React, { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const AdminPage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (keycloak?.token) {
      fetch('http://localhost:5000/api/admin-data', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error('Error fetching data', error));
    }
  }, [keycloak?.token]);

  return (
    <div>
      <h1>Admin Page</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>Loading data...</div>
      )}
    </div>
  );
};

export default AdminPage;
