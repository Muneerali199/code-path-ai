import { Injectable, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

export interface ApiKey {
  id: string;
  userId: string;
  key: string; // This will be the actual API key
  name: string; // Name/description of the key
  createdAt: Date;
  expiresAt?: Date;
  scopes: string[]; // Permissions associated with this key
  lastUsedAt?: Date;
  isActive: boolean;
}

@Injectable()
export class ApiKeyAuthService {
  private readonly logger = new Logger(ApiKeyAuthService.name);
  private apiKeys: ApiKey[] = [];

  constructor(
    private configService?: ConfigService,
    private jwtService?: JwtService,
  ) {
    // Initialize with a default API key for development
    this.initializeDefaultApiKey();
  }

  private initializeDefaultApiKey() {
    // In a real application, you wouldn't hardcode API keys
    // This is just for development purposes
    const defaultApiKey: ApiKey = {
      id: uuidv4(),
      userId: 'default-user',
      key: 'cp_dev_key_default_for_testing_purpose',
      name: 'Development API Key',
      createdAt: new Date(),
      scopes: ['ai:read', 'ai:write', 'vscode:access'],
      isActive: true,
    };

    this.apiKeys.push(defaultApiKey);
    this.logger.log(`Default API key created: ${defaultApiKey.name} with key: ${defaultApiKey.key}`);
  }

  /**
   * Creates a new API key for a user
   */
  async createApiKey(userId: string, name: string, scopes: string[] = []): Promise<Pick<ApiKey, 'id' | 'key' | 'name' | 'createdAt' | 'scopes'>> {
    const apiKey: ApiKey = {
      id: uuidv4(),
      userId,
      key: this.generateSecureApiKey(),
      name,
      createdAt: new Date(),
      scopes: scopes.length > 0 ? scopes : ['ai:read', 'ai:write'], // Default scopes
      isActive: true,
    };

    this.apiKeys.push(apiKey);

    this.logger.log(`New API key created for user ${userId}: ${name}`);

    // Return only the necessary fields, not the full object
    return {
      id: apiKey.id,
      key: apiKey.key,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
      scopes: apiKey.scopes,
    };
  }

  /**
   * Validates an API key and returns associated user info
   */
  async validateApiKey(apiKey: string): Promise<{ userId: string; scopes: string[] } | null> {
    if (!apiKey) {
      return null;
    }

    const keyRecord = this.apiKeys.find(k => k.key === apiKey && k.isActive);

    if (!keyRecord) {
      return null;
    }

    // Update last used timestamp
    keyRecord.lastUsedAt = new Date();

    // Check if key is expired
    if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
      keyRecord.isActive = false;
      this.logger.warn(`Expired API key attempted: ${keyRecord.id}`);
      return null;
    }

    this.logger.log(`Valid API key used: ${keyRecord.name} (${keyRecord.id})`);

    return {
      userId: keyRecord.userId,
      scopes: keyRecord.scopes,
    };
  }

  /**
   * Revokes an API key
   */
  async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    const keyIndex = this.apiKeys.findIndex(k => k.id === keyId && k.userId === userId);

    if (keyIndex === -1) {
      return false;
    }

    this.apiKeys[keyIndex].isActive = false;
    this.logger.log(`API key revoked: ${keyId}`);

    return true;
  }

  /**
   * Gets API key info (without the actual key)
   */
  async getApiKeyInfo(keyId: string, userId: string): Promise<Omit<ApiKey, 'key'> | null> {
    const keyRecord = this.apiKeys.find(k => k.id === keyId && k.userId === userId);

    if (!keyRecord) {
      return null;
    }

    // Return the key record without the actual key value
    const { key, ...keyInfo } = keyRecord;
    return keyInfo;
  }

  /**
   * Checks if the API key has the required scopes
   */
  hasScope(scopes: string[], requiredScope: string): boolean {
    // If no scopes are defined, assume full access
    if (!scopes || scopes.length === 0) {
      return true;
    }

    // Check if the required scope is in the list of allowed scopes
    return scopes.includes(requiredScope) || scopes.includes('*'); // '*' means all scopes
  }

  /**
   * Generates a secure API key
   */
  private generateSecureApiKey(): string {
    // Generate a random UUID and prefix it for identification
    return 'cp_' + uuidv4().replace(/-/g, '');
  }
}