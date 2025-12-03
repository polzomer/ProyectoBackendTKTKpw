const API_BASE = 'http://localhost:3000/api';

export async function purchaseCoins(usuarioId: string, cantidad: number) {
  const res = await fetch(`${API_BASE}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId, cantidad_monedas: cantidad })
  });
  if (!res.ok) throw new Error('Error en compra');
  return res.json();
}

export async function sendDonation(params: { usuario_id: string; stream_id: string; regalo_id?: number; monedas_gastadas: number; puntos_ganados: number; mensaje?: string; }) {
  if (!/^\d+$/.test(params.stream_id)) {
    throw new Error('Stream inválido: debes estar en un stream real');
  }
  const res = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    let msg = 'Error en donación';
    try { const data = await res.json(); msg = data.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function addChatMessage(params: { stream_id: string; usuario_id?: string; alias?: string; nivel?: string; texto: string; }) {
  if (!/^\d+$/.test(params.stream_id)) {
    throw new Error('Stream inválido: usa un stream real');
  }
  const res = await fetch(`${API_BASE}/chat/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    let msg = 'Error en chat';
    try { const data = await res.json(); msg = data.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getUser(userId: string) {
  const res = await fetch(`${API_BASE}/users/${userId}`);
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
}

export async function getGifts(userId: string) {
  const res = await fetch(`${API_BASE}/gifts?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Error al obtener regalos');
  return res.json();
}

export async function createGift(payload: { nombre: string; icono: string; costo_monedas: number; puntos_otorgados: number; creado_por: string; }) {
  const res = await fetch(`${API_BASE}/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al crear regalo');
  return res.json();
}

export async function updateGift(id: number, payload: { nombre: string; icono: string; costo_monedas: number; puntos_otorgados: number; }) {
  const res = await fetch(`${API_BASE}/gifts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al actualizar regalo');
  return res.json();
}

export async function deleteGift(id: number) {
  const res = await fetch(`${API_BASE}/gifts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar regalo');
  return res.json();
}

export async function registerUser(payload: { nombre: string; username?: string; email?: string; telefono?: string; fecha_nacimiento?: string; password: string; }) {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al registrar usuario');
  return res.json();
}

export async function loginUser(identifier: string, password: string) {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });
  if (!res.ok) throw new Error('Credenciales inválidas');
  return res.json();
}

export async function updateUserServer(userId: string, payload: { monedas?: number; puntos?: number; nivel_actual?: string; puntos_siguiente_nivel?: number; horas_streamer?: number; estado?: string; }) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json();
}

export async function createStream(payload: { usuario_id: string; categoria_id?: number | null; titulo: string; descripcion?: string; estado?: string; }) {
  const res = await fetch(`${API_BASE}/streams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    let msg = 'Error al crear stream';
    try { const data = await res.json(); msg = data.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function streamHeartbeat(streamId: string, seconds: number, viewerId?: string) {
  const res = await fetch(`${API_BASE}/streams/${streamId}/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seconds, viewer_id: viewerId })
  });
  if (!res.ok) throw new Error('Error en heartbeat');
  return res.json();
}

export async function endStream(streamId: string) {
  const res = await fetch(`${API_BASE}/streams/${streamId}/end`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al finalizar stream');
  return res.json();
}
