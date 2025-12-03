import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { initDb, models, seedDefaults, computeViewerLevel, computeStreamerLevel, computeLevelState, advanceLevel } from './setup.js';

const PASSWORD_MODE = (process.env.PASSWORD_ENCODING || process.env.INSECURE_PASSWORD_ENCODING || '').toLowerCase();
const useBase64 = PASSWORD_MODE === 'base64';
const isBcrypt = (hash) => typeof hash === 'string' && /^\$2[aby]\$\d{2}\$/.test(hash);

const app = express();
app.use(cors());
app.use(express.json());

await initDb();
await seedDefaults();

const nowLocal = () => new Date(Date.now() - 5 * 60 * 60 * 1000);

// Acumulador en memoria para convertir segundos en horas de streamer (10s = 1 unidad)
const hoursAccumulator = new Map();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { nombre, username, email, telefono, fecha_nacimiento, password } = req.body;
    if (!nombre || !password) return res.status(400).json({ error: 'nombre y password requeridos' });
    const password_hash = useBase64
      ? Buffer.from(String(password), 'utf8').toString('base64')
      : await bcrypt.hash(String(password), 10);
    const baseLevel = computeViewerLevel(0);
    const user = await models.Usuario.create({
      nombre,
      username,
      email,
      telefono,
      fecha_nacimiento,
      password_hash,
      monedas: 0,
      puntos: 0,
      nivel_actual: baseLevel.currentLevelName,
      puntos_siguiente_nivel: baseLevel.pointsToNextLevel
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const where = {};
    if (identifier && identifier.includes('@')) where.email = identifier;
    else where.username = identifier;
    const user = await models.Usuario.findOne({ where });
    if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
    if (useBase64) {
      const encoded = Buffer.from(String(password), 'utf8').toString('base64');
      if (user.password_hash === encoded) {
        // ok
      } else if (isBcrypt(user.password_hash)) {
        const ok = await bcrypt.compare(String(password), user.password_hash).catch(() => false);
        if (!ok) return res.status(401).json({ error: 'credenciales inválidas' });
        await user.update({ password_hash: encoded });
      } else {
        return res.status(401).json({ error: 'credenciales inválidas' });
      }
    } else {
      const ok = await bcrypt.compare(String(password), user.password_hash).catch(() => false);
      if (!ok) {
        const encoded = Buffer.from(String(password), 'utf8').toString('base64');
        if (user.password_hash === encoded) {
          const newHash = await bcrypt.hash(String(password), 10);
          await user.update({ password_hash: newHash });
        } else {
          return res.status(401).json({ error: 'credenciales inválidas' });
        }
      }
    }
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await models.Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/normalize-levels', async (req, res) => {
  try {
    const users = await models.Usuario.findAll();
    const updated = [];
    for (const user of users) {
      const total = Number(user.puntos || 0);
      const state = computeLevelState(total);
      await user.update({ puntos: state.remainder, nivel_actual: state.currentLevelName, puntos_siguiente_nivel: state.pointsToNextLevel });
      updated.push({ id: user.id, nivel_actual: state.currentLevelName, puntos: state.remainder });
    }
    res.json({ ok: true, updated_count: updated.length, users: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const allowed = ['monedas', 'puntos', 'nivel_actual', 'puntos_siguiente_nivel', 'horas_streamer', 'estado'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await models.Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
    await user.update(data);
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users/:id/coins/increment', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await models.Usuario.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
    const monedas = (user.monedas || 0) + Number(amount || 0);
    await user.update({ monedas });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/coin-packages', async (req, res) => {
  const rows = await models.Moneda.findAll({ order: [['cantidad', 'ASC']] });
  res.json(rows);
});

app.post('/api/purchases', async (req, res) => {
  try {
    const { usuario_id, cantidad_monedas } = req.body;
    const user = await models.Usuario.findByPk(usuario_id);
    if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
    let pkg = await models.Moneda.findOne({ where: { cantidad: cantidad_monedas } });
    if (!pkg) {
      const rate = 0.04;
      const precio = Math.max(0.01, Math.round(Number(cantidad_monedas || 0) * rate * 100) / 100);
      pkg = await models.Moneda.create({ cantidad: Number(cantidad_monedas || 0), precio, activo: true });
    }
    const precio_total = pkg.precio;
    const compra = await models.Compra.create({ usuario_id, moneda_id: pkg.id, cantidad_monedas, precio_total, estado: 'pagado' });
    const monedas = (user.monedas || 0) + Number(cantidad_monedas || 0);
    await user.update({ monedas });
    res.json({ compra, usuario: user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/gifts', async (req, res) => {
  try {
    const { userId } = req.query;
    const where = {};
    if (userId) where.creado_por = userId;
    const custom = await models.Regalo.findAll({ where, order: [['id', 'ASC']] });
    const defaults = await models.Regalo.findAll({ where: { creado_por: null } });
    res.json({ defaults, custom });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/gifts', async (req, res) => {
  try {
    const { nombre, icono, costo_monedas, puntos_otorgados, creado_por } = req.body;
    const gift = await models.Regalo.create({ nombre, icono, costo_monedas, puntos_otorgados, creado_por });
    res.json(gift);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/gifts/:id', async (req, res) => {
  try {
    const gift = await models.Regalo.findByPk(req.params.id);
    if (!gift) return res.status(404).json({ error: 'regalo no encontrado' });
    const { nombre, icono, costo_monedas, puntos_otorgados } = req.body;
    await gift.update({ nombre, icono, costo_monedas, puntos_otorgados });
    res.json(gift);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/gifts/:id', async (req, res) => {
  try {
    const gift = await models.Regalo.findByPk(req.params.id);
    if (!gift) return res.status(404).json({ error: 'regalo no encontrado' });
    await gift.destroy();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

  app.post('/api/donations', async (req, res) => {
    try {
      const { usuario_id, stream_id, regalo_id, monedas_gastadas, puntos_ganados, mensaje } = req.body;
      const user = await models.Usuario.findByPk(usuario_id);
      if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
      let stream = await models.Stream.findByPk(stream_id);
      if (!stream) {
        const isNumeric = /^\d+$/.test(String(stream_id || ''));
        if (!isNumeric) {
          stream = await models.Stream.create({
            usuario_id,
            categoria_id: null,
            titulo: 'Stream de Inicio',
            descripcion: String(stream_id),
            estado: 'en_vivo',
            fecha_inicio: nowLocal(),
          });
        } else {
          return res.status(404).json({ error: 'stream no encontrado' });
        }
      }
      const amountCoins = Math.max(0, Number(monedas_gastadas || 0));
      if ((user.monedas || 0) < amountCoins) {
        return res.status(400).json({ error: 'monedas insuficientes' });
      }
    let giftId = regalo_id;
    if (!giftId) {
      let giftName = '';
      if (typeof mensaje === 'string' && mensaje.startsWith('Regalo: ')) {
        giftName = mensaje.replace('Regalo: ', '').trim();
      }
      if (giftName) {
        const existing = await models.Regalo.findOne({ where: { nombre: giftName } });
        if (existing) {
          giftId = existing.id;
        } else {
          const createdGift = await models.Regalo.create({ nombre: giftName, icono: '🎁', costo_monedas: Number(monedas_gastadas || 0), puntos_otorgados: Number(puntos_ganados || 0), creado_por: null });
          giftId = createdGift.id;
        }
      } else {
        const createdGift = await models.Regalo.create({ nombre: 'Regalo', icono: '🎁', costo_monedas: Number(monedas_gastadas || 0), puntos_otorgados: Number(puntos_ganados || 0), creado_por: null });
        giftId = createdGift.id;
      }
    }
      const donation = await models.Donacion.create({ usuario_id, stream_id, regalo_id: giftId, monedas_gastadas: amountCoins, puntos_ganados, mensaje });
      const monedas = Math.max(0, (user.monedas || 0) - amountCoins);
    const adv = advanceLevel(user.nivel_actual || 'Bronce', user.puntos || 0, Number(puntos_ganados || 0));
    await user.update({ monedas, puntos: adv.remainder, nivel_actual: adv.currentLevelName, puntos_siguiente_nivel: adv.pointsToNextLevel });
    res.json({ donacion: donation, usuario: user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

app.post('/api/streams', async (req, res) => {
  try {
    const { usuario_id, categoria_id, titulo, descripcion } = req.body;
    const stream = await models.Stream.create({ usuario_id, categoria_id, titulo, descripcion, estado: 'en_vivo', fecha_inicio: nowLocal() });
    res.json(stream);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/streams', async (req, res) => {
  try {
    const { categoria_id } = req.query;
    const where = {};
    if (categoria_id) where.categoria_id = categoria_id;
    const streams = await models.Stream.findAll({ where, order: [['id', 'DESC']] });
    res.json(streams);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/streams/:id', async (req, res) => {
  try {
    const stream = await models.Stream.findByPk(req.params.id);
    if (!stream) return res.status(404).json({ error: 'stream no encontrado' });
    res.json(stream);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/streams/:id/heartbeat', async (req, res) => {
  try {
    const stream = await models.Stream.findByPk(req.params.id);
    if (!stream) return res.status(404).json({ error: 'stream no encontrado' });
    if (stream.estado !== 'en_vivo') return res.status(400).json({ error: 'stream no activo' });
    const seconds = Number(req.body.seconds || 1);
    const viewerId = req.body.viewer_id;

    let usuario = null;
    if (viewerId) {
      const viewer = await models.Usuario.findByPk(viewerId);
      if (viewer) {
        const isStreamer = String(viewer.id) === String(stream.usuario_id);
        if (isStreamer) {
          const adv = advanceLevel(viewer.nivel_actual || 'Bronce', viewer.puntos || 0, seconds);
          const updates = { puntos: adv.remainder, nivel_actual: adv.currentLevelName, puntos_siguiente_nivel: adv.pointsToNextLevel };
          const key = String(viewer.id);
          const prev = hoursAccumulator.get(key) || 0;
          const total = prev + seconds;
          const addUnits = Math.floor(total / 10);
          const remainder = total % 10;
          hoursAccumulator.set(key, remainder);
          if (addUnits > 0) {
            const horas_streamer = (viewer.horas_streamer || 0) + addUnits;
            Object.assign(updates, { horas_streamer });
          }
          await viewer.update(updates);
        }
        usuario = viewer;
      }
    } else {
      const streamer = await models.Usuario.findByPk(stream.usuario_id);
      if (streamer) {
        const adv = advanceLevel(streamer.nivel_actual || 'Bronce', streamer.puntos || 0, seconds);
        const key = String(stream.usuario_id);
        const prev = hoursAccumulator.get(key) || 0;
        const total = prev + seconds;
        const addUnits = Math.floor(total / 10);
        const remainder = total % 10;
        hoursAccumulator.set(key, remainder);
        const baseUpdates = { puntos: adv.remainder, nivel_actual: adv.currentLevelName, puntos_siguiente_nivel: adv.pointsToNextLevel };
        if (addUnits > 0) {
          const horas_streamer = (streamer.horas_streamer || 0) + addUnits;
          Object.assign(baseUpdates, { horas_streamer });
        }
        await streamer.update(baseUpdates);
        usuario = streamer;
      }
    }

    res.json({ usuario, stream });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/streams/:id/end', async (req, res) => {
  try {
    const stream = await models.Stream.findByPk(req.params.id);
    if (!stream) return res.status(404).json({ error: 'stream no encontrado' });
    await stream.update({ estado: 'finalizado', fecha_fin: nowLocal() });
    hoursAccumulator.delete(String(stream.usuario_id));
    res.json(stream);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/chat/messages', async (req, res) => {
  try {
    const { stream_id, usuario_id, alias, nivel, texto } = req.body;
    const stream = await models.Stream.findByPk(stream_id);
    if (!stream) return res.status(404).json({ error: 'stream no encontrado' });
    const message = await models.MensajeChat.create({ stream_id, usuario_id, alias, nivel, texto });
    if (usuario_id) {
      const user = await models.Usuario.findByPk(usuario_id);
      if (user) {
        const adv = advanceLevel(user.nivel_actual || 'Bronce', user.puntos || 0, 1);
        await user.update({ puntos: adv.remainder, nivel_actual: adv.currentLevelName, puntos_siguiente_nivel: adv.pointsToNextLevel });
      }
    }
    res.json(message);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/chat/messages', async (req, res) => {
  try {
    const { stream_id } = req.query;
    const where = stream_id ? { stream_id } : {};
    const messages = await models.MensajeChat.findAll({ where, order: [['id', 'ASC']] });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
