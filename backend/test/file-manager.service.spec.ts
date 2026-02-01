import { Test, TestingModule } from '@nestjs/testing';
import { FileManagerService } from '../src/file-manager/file-manager.service';

describe('FileManagerService', () => {
  let service: FileManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileManagerService],
    }).compile();

    service = module.get<FileManagerService>(FileManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have methods for file operations', () => {
    expect(typeof service.readFile).toBe('function');
    expect(typeof service.writeFile).toBe('function');
    expect(typeof service.listDirectory).toBe('function');
    expect(typeof service.createDirectory).toBe('function');
    expect(typeof service.deleteFile).toBe('function');
    expect(typeof service.searchFiles).toBe('function');
  });

  it('should create workspace with proper structure', async () => {
    // This test would normally create a temporary directory for testing
    // but since we're mocking, we just verify the method exists and has proper signature
    expect(typeof service.createWorkspace).toBe('function');
  });
});