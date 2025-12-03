import type { Gift, LevelConfig } from './types';

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  dob?: string;
  password?: string;
  coins: number;
  points: number;
  nivel_actual?: string;
  likedVideos: string[];
  streamerHours?: number;
  customGifts?: Gift[];
  viewerLevelConfig?: LevelConfig[];
  following?: string[];
}

const ACTIVE_KEY = "pw_active_user";
const USERS_KEY = "pw_users";

export const getUsers = (): User[] => {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) as User[] : [];
};

export const saveUsers = (users: User[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

export const getActiveUser = (): User | null => {
  const raw = localStorage.getItem(ACTIVE_KEY) || sessionStorage.getItem(ACTIVE_KEY);
  return raw ? JSON.parse(raw) as User : null;
};

export const setActiveUser = (u: User) =>
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(u));

export const clearActiveUser = () => {
  localStorage.removeItem(ACTIVE_KEY);
  sessionStorage.removeItem(ACTIVE_KEY);
};

export const findUserByEmail = (email: string) =>
  getUsers().find(u => u.email?.toLowerCase() === email.toLowerCase());

export const findUserByUsername = (username: string) =>
  getUsers().find(u => u.username?.toLowerCase() === username.toLowerCase());

export const createUser = (u: Omit<User, "id" | "coins" | "points" | "likedVideos"> & { password: string }) => {
  const users = getUsers();
  const user = {
    id: crypto.randomUUID(),
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    dob: u.dob,
    password: btoa(u.password),
    coins: 0,
    points: 0,
    nivel_actual: 'Bronce',
    likedVideos: [],
    streamerHours: 0,
    customGifts: [],
    viewerLevelConfig: [],
    following: [],
  } as User;
  users.push(user);
  saveUsers(users);
  return user;
};

export const verifyCredentials = (identifier: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u =>
    (u.email && u.email.toLowerCase() === identifier.toLowerCase())
    || (u.username && u.username.toLowerCase() === identifier.toLowerCase())
  );
  if (!user || !user.password) return null;
  if (user.password === btoa(password)) return user;
  return null;
};

export const updateUser = (u: User) => {
  const users = getUsers();
  const updated = users.map(x => x.id === u.id ? u : x);
  saveUsers(updated);
  const active = getActiveUser();
  if (active?.id === u.id) {
    if (localStorage.getItem(ACTIVE_KEY)) {
      setActiveUser(u);
    } else {
      sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(u));
    }
  }
};

export const toggleFollowStreamer = (streamerId: string) => {
  const user = getActiveUser();
  if (!user) return;
  const following = user.following || [];
  const isFollowing = following.includes(streamerId);
  const updatedFollowing = isFollowing
    ? following.filter(id => id !== streamerId)
    : [...following, streamerId];
  const updatedUser = { ...user, following: updatedFollowing };
  updateUser(updatedUser);
  window.dispatchEvent(new CustomEvent("userChanged"));
};
