export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher';
  coins?: number;
  avatarConfig?: {
    skinColor: string;
    hairId: string;
    topId: string;
    bottomId: string;
    shoesId: string;
    accessoryId?: string;
    expression?: string;
  };
  createdAt?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

