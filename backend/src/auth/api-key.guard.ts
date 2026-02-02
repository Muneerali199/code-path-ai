import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiKeyAuthService } from './api-key-auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeyAuthService: ApiKeyAuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Extract API key from Authorization header (format: "Bearer <api_key>")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const apiKey = authHeader.substring(7).trim(); // Remove "Bearer " prefix

    // Validate the API key
    return this.validateApiKey(apiKey, request);
  }

  private async validateApiKey(apiKey: string, request: any): Promise<boolean> {
    try {
      const keyInfo = await this.apiKeyAuthService.validateApiKey(apiKey);
      
      if (!keyInfo) {
        return false;
      }

      // Attach user info to request for use in controllers
      request.user = { id: keyInfo.userId };
      request.apiKeyScopes = keyInfo.scopes;

      return true;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }
}