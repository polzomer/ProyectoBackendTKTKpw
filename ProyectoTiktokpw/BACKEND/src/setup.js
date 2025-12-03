import { Sequelize, DataTypes } from 'sequelize';
import mysql from 'mysql2/promise';

const DB_NAME = process.env.DB_NAME || 'proyecto_tiktokpw';
export const sequelize = new Sequelize(
  DB_NAME,
  process.env.DB_USER || 'leonardo',
  process.env.DB_PASS || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    timezone: '-05:00',
    define: { freezeTableName: true }
  }
);

export const models = {};

export async function initDb() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456'
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
  models.Usuario = sequelize.define('usuarios', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    username: { type: DataTypes.STRING(50) },
    email: { type: DataTypes.STRING(150) },
    telefono: { type: DataTypes.STRING(20) },
    fecha_nacimiento: { type: DataTypes.DATEONLY },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    monedas: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    puntos: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    nivel_actual: { type: DataTypes.STRING(50) },
    puntos_siguiente_nivel: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    horas_streamer: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    estado: { type: DataTypes.ENUM('activo','suspendido'), defaultValue: 'activo' }
  }, { timestamps: false });

  models.Categoria = sequelize.define('categorias', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(120), allowNull: false },
    descripcion: { type: DataTypes.STRING(255) }
  }, { timestamps: false });

  models.Moneda = sequelize.define('monedas', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    cantidad: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { timestamps: false });

  models.Regalo = sequelize.define('regalos', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    icono: { type: DataTypes.STRING(20), allowNull: false },
    costo_monedas: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    puntos_otorgados: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    creado_por: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true }
  }, { timestamps: false });

  models.Stream = sequelize.define('streams', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    categoria_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    estado: { type: DataTypes.ENUM('programado','en_vivo','finalizado'), defaultValue: 'programado' },
    fecha_inicio: { type: DataTypes.DATE },
    fecha_fin: { type: DataTypes.DATE }
  }, { timestamps: false });

  models.Compra = sequelize.define('compras', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    moneda_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    cantidad_monedas: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    precio_total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    estado: { type: DataTypes.ENUM('pendiente','pagado','fallido','reembolsado'), defaultValue: 'pagado' },
    metodo_pago: { type: DataTypes.STRING(50) }
  }, { timestamps: false });

  models.Donacion = sequelize.define('donaciones', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    stream_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    regalo_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    monedas_gastadas: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    puntos_ganados: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    mensaje: { type: DataTypes.STRING(255) }
  }, { timestamps: false });

  models.MensajeChat = sequelize.define('mensajes_chat', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    stream_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    usuario_id: { type: DataTypes.BIGINT.UNSIGNED },
    alias: { type: DataTypes.STRING(100) },
    nivel: { type: DataTypes.STRING(50) },
    texto: { type: DataTypes.STRING(500), allowNull: false }
  }, { timestamps: false });

  models.Usuario.hasMany(models.Stream, { foreignKey: 'usuario_id' });
  models.Stream.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  models.Categoria.hasMany(models.Stream, { foreignKey: 'categoria_id' });
  models.Stream.belongsTo(models.Categoria, { foreignKey: 'categoria_id' });
  models.Usuario.hasMany(models.Compra, { foreignKey: 'usuario_id' });
  models.Compra.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  models.Moneda.hasMany(models.Compra, { foreignKey: 'moneda_id' });
  models.Compra.belongsTo(models.Moneda, { foreignKey: 'moneda_id' });
  models.Usuario.hasMany(models.Donacion, { foreignKey: 'usuario_id' });
  models.Donacion.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  models.Stream.hasMany(models.Donacion, { foreignKey: 'stream_id' });
  models.Donacion.belongsTo(models.Stream, { foreignKey: 'stream_id' });
  models.Regalo.hasMany(models.Donacion, { foreignKey: 'regalo_id' });
  models.Donacion.belongsTo(models.Regalo, { foreignKey: 'regalo_id' });
  models.Usuario.hasMany(models.MensajeChat, { foreignKey: 'usuario_id' });
  models.MensajeChat.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  models.Stream.hasMany(models.MensajeChat, { foreignKey: 'stream_id' });
  models.MensajeChat.belongsTo(models.Stream, { foreignKey: 'stream_id' });

  await sequelize.authenticate();
  await sequelize.sync();
}

export async function seedDefaults() {
  const defaults = [
    { nombre: 'Rosa', icono: '🌹', costo_monedas: 10, puntos_otorgados: 5, creado_por: null },
    { nombre: 'Corazón', icono: '❤️', costo_monedas: 50, puntos_otorgados: 25, creado_por: null },
    { nombre: 'Fuego', icono: '🔥', costo_monedas: 100, puntos_otorgados: 60, creado_por: null },
    { nombre: 'Diamante', icono: '💎', costo_monedas: 500, puntos_otorgados: 300, creado_por: null }
  ];
  for (const g of defaults) {
    const exists = await models.Regalo.findOne({ where: { nombre: g.nombre, creado_por: null } });
    if (!exists) await models.Regalo.create(g);
  }
  const coinPkgs = [100, 550, 1200, 2500];
  for (const cantidad of coinPkgs) {
    const exists = await models.Moneda.findOne({ where: { cantidad } });
    if (!exists) await models.Moneda.create({ cantidad, precio: cantidad === 100 ? 5 : cantidad === 550 ? 25 : cantidad === 1200 ? 50 : 100, activo: true });
  }
}

export function computeViewerLevel(userPoints) {
  const base = 50;
  const growth = 0.3;
  const names = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Maestro I', 'Maestro II', 'Maestro III', 'Maestro IV', 'Maestro V', 'Dios'];
  const levels = [];
  let threshold = 0;
  let range = base;
  for (let i = 0; i < names.length; i++) {
    levels.push({ name: names[i], points: threshold });
    threshold = threshold + (i === 0 ? base : range);
    range = Math.ceil(range * (1 + growth));
  }
  let idx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (userPoints >= levels[i].points) { idx = i; break; }
  }
  const current = levels[idx];
  const next = levels[idx + 1];
  if (!next) return { currentLevelName: current.name, pointsToNextLevel: 0 };
  return { currentLevelName: current.name, pointsToNextLevel: Math.max(0, next.points - userPoints) };
}

export function computeStreamerLevel(hours) {
  const levels = [
    { name: 'Bronce', hours: 0 },
    { name: 'Plata', hours: 1 / 60 },
    { name: 'Oro', hours: 5 / 60 },
    { name: 'Diamante', hours: 10 / 60 },
    { name: 'Maestro', hours: 60 / 60 }
  ];
  let idx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (hours >= levels[i].hours) { idx = i; break; }
  }
  return levels[idx].name;
}

export function computeLevelState(points) {
  const base = 50;
  const growth = 0.3;
  const names = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Maestro I', 'Maestro II', 'Maestro III', 'Maestro IV', 'Maestro V', 'Dios'];
  const levels = [];
  let threshold = 0;
  let range = base;
  for (let i = 0; i < names.length; i++) {
    levels.push({ name: names[i], points: threshold });
    threshold = threshold + (i === 0 ? base : range);
    range = Math.ceil(range * (1 + growth));
  }
  let idx = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].points) { idx = i; break; }
  }
  const current = levels[idx];
  const next = levels[idx + 1];
  const basePoints = current.points;
  const remainder = Math.max(0, points - basePoints);
  const pointsToNextLevel = next ? Math.max(0, next.points - points) : 0;
  return { currentLevelName: current.name, remainder, pointsToNextLevel };
}

export function advanceLevel(currentName, remainder, increment) {
  const base = 50;
  const growth = 0.3;
  const names = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Maestro I', 'Maestro II', 'Maestro III', 'Maestro IV', 'Maestro V', 'Dios'];
  const levels = [];
  let threshold = 0;
  let range = base;
  for (let i = 0; i < names.length; i++) {
    levels.push({ name: names[i], points: threshold });
    threshold = threshold + (i === 0 ? base : range);
    range = Math.ceil(range * (1 + growth));
  }
  let normalized = String(currentName || '').trim();
  if (normalized === 'Maestro') normalized = 'Maestro I';
  let idx = names.indexOf(normalized);
  if (idx < 0) idx = 0;
  let carry = Math.max(0, Number(remainder || 0)) + Math.max(0, Number(increment || 0));
  while (idx < levels.length - 1) {
    const range = levels[idx + 1].points - levels[idx].points;
    if (carry >= range) {
      carry -= range;
      idx += 1;
    } else {
      break;
    }
  }
  const next = levels[idx + 1];
  const pointsToNextLevel = next ? Math.max(0, (next.points - levels[idx].points) - carry) : 0;
  return { currentLevelName: names[idx], remainder: carry, pointsToNextLevel };
}
