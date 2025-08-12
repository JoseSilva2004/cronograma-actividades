const API_URL = 'http://localhost:5000/api';

export const fetchActivities = async () => {
  const response = await fetch(`${API_URL}/actividades`);
  return await response.json();
};

export const createActivity = async (activity: {
  nombre: string;
  estado: string;
  responsable: string;
}) => {
  const response = await fetch(`${API_URL}/actividades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity)
  });
  return await response.json();
};

export const updateActivity = async (id: number, activity: {
  nombre: string;
  estado: string;
  responsable: string;
}) => {
  const response = await fetch(`${API_URL}/actividades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity)
  });
  return await response.json();
};

export const deleteActivity = async (id: number) => {
  const response = await fetch(`${API_URL}/actividades/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};