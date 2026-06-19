// src/services/__tests__/authService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock de bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

// Mock de jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('fake.jwt.token'),
    verify: vi.fn(),
  },
}));

// Mock del repositorio de TypeORM
const mockUserRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

const mockAvatarRepo = {
  create: vi.fn(),
  save: vi.fn(),
};

vi.mock('../../config/database', () => ({
  AppDataSource: {
    getRepository: vi.fn((entity) => {
      if (entity?.name === 'AvatarConfig') return mockAvatarRepo;
      return mockUserRepo;
    }),
  },
}));

vi.mock('../../config/environment', () => ({
  env: {
    jwt: { secret: 'test-secret', expiresIn: '7d' },
  },
}));

// ── Import después de los mocks ───────────────────────────────────────────────
import { authService } from '../authService';
import bcrypt from 'bcryptjs';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('authService', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('debe registrar un usuario nuevo y devolver token', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null); // No existe usuario previo
      mockUserRepo.create.mockReturnValue({ id: 'user-123', name: 'Gus', email: 'gus@test.com' });
      mockUserRepo.save.mockResolvedValue({ id: 'user-123', name: 'Gus', email: 'gus@test.com' });
      mockAvatarRepo.create.mockReturnValue({ userId: 'user-123' });
      mockAvatarRepo.save.mockResolvedValue({});

      // Act
      const result = await authService.register('Gus', 'gus@test.com', 'password123');

      // Assert
      expect(result).toHaveProperty('token', 'fake.jwt.token');
      expect(result.user).toMatchObject({ id: 'user-123', name: 'Gus', email: 'gus@test.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('debe lanzar error si el nombre o email ya existe', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing', name: 'Gus', email: 'gus@test.com' });

      // Act & Assert
      await expect(
        authService.register('Gus', 'gus@test.com', 'password123')
      ).rejects.toThrow('El nombre o email ya está registrado');
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('debe devolver token con credenciales correctas', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-123',
        name: 'Gus',
        email: 'gus@test.com',
        passwordHash: 'hashed_password',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await authService.login('gus@test.com', 'password123');

      // Assert
      expect(result).toHaveProperty('token', 'fake.jwt.token');
      expect(result.user.email).toBe('gus@test.com');
    });

    it('debe lanzar error si el email no existe', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login('noexiste@test.com', 'password123')
      ).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('debe lanzar error si la contraseña es incorrecta', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-123',
        email: 'gus@test.com',
        passwordHash: 'hashed_password',
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act & Assert
      await expect(
        authService.login('gus@test.com', 'wrongpassword')
      ).rejects.toThrow('Email o contraseña incorrectos');
    });
  });

  // ── getMe ─────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('debe devolver el usuario sin passwordHash', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-123',
        name: 'Gus',
        email: 'gus@test.com',
        passwordHash: 'secret_hash',
        avatarConfig: {},
      });

      // Act
      const result = await authService.getMe('user-123');

      // Assert
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toMatchObject({ id: 'user-123', name: 'Gus' });
    });

    it('debe lanzar error si el usuario no existe', async () => {
      // Arrange
      mockUserRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getMe('user-inexistente')).rejects.toThrow('Usuario no encontrado');
    });
  });
});