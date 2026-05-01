import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.userRepository.create({
      data: {
        email: dto.email,
        password: hashedPassword,
      },
    });

    return {
      uid: user.uid,
      email: user.email,
      created_at: user.created_at,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.uid, email: user.email };
    
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'fallback-secret-for-dev',
      }),
      user: {
        uid: user.uid,
        email: user.email,
      }
    };
  }
}
