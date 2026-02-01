import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export class CreateUserDto {
  email: string;
  username: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

@Injectable()
export class AuthService {
  private users: User[] = []; // In a real app, this would be a database

  constructor(private jwtService: JwtService) {
    // Add a default admin user for testing
    this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    const defaultUser: CreateUserDto = {
      email: 'admin@codepath.ai',
      username: 'admin',
      password: 'password123',
    };

    try {
      await this.register(defaultUser);
    } catch (error) {
      // Ignore if user already exists
    }
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const { email, username, password } = createUserDto;

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      email,
      username,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    this.users.push(newUser);

    // Generate tokens
    const accessToken = this.jwtService.sign({ 
      sub: newUser.id, 
      email: newUser.email,
      username: newUser.username 
    }, { expiresIn: '1h' });

    const refreshToken = this.jwtService.sign({ 
      sub: newUser.id, 
      email: newUser.email,
      username: newUser.username 
    }, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      }
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email,
      username: user.username 
    }, { expiresIn: '1h' });

    const refreshToken = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email,
      username: user.username 
    }, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async refreshTokens(userId: string): Promise<Omit<AuthResponse, 'user'> | null> {
    const user = this.users.find(u => u.id === userId);
    if (!user || !user.isActive) {
      return null;
    }

    const accessToken = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email,
      username: user.username 
    }, { expiresIn: '1h' });

    const refreshToken = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email,
      username: user.username 
    }, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}