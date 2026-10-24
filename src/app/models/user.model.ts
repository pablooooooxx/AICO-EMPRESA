export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  createdAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
