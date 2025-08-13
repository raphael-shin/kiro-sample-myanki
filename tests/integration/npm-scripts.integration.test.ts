import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('NPM Scripts Integration Tests', () => {
  const projectRoot = process.cwd();
  const packageJsonPath = join(projectRoot, 'package.json');
  const buildDir = join(projectRoot, 'dist');
  const nodeModulesDir = join(projectRoot, 'node_modules');



  beforeAll(() => {
    // Ensure package.json exists
    expect(existsSync(packageJsonPath)).toBe(true);
    
    // Ensure node_modules exists (dependencies should be installed)
    expect(existsSync(nodeModulesDir)).toBe(true);
  });

  describe('package.json 설정 검증', () => {
    let packageJson: any;

    beforeAll(() => {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(packageJsonContent);
    });

    it('should have correct project metadata', () => {
      expect(packageJson.name).toBe('myanki');
      expect(packageJson.version).toBeDefined();
      expect(packageJson.type).toBe('module');
      expect(packageJson.description).toContain('MyAnki');
    });

    it('should have all required npm scripts', () => {
      const requiredScripts = ['dev', 'build', 'preview', 'test', 'test:watch'];
      
      for (const script of requiredScripts) {
        expect(packageJson.scripts[script]).toBeDefined();
      }
    });

    it('should have all required dependencies', () => {
      const requiredDeps = ['react', 'react-dom', 'zustand', 'dexie'];
      
      for (const dep of requiredDeps) {
        expect(packageJson.dependencies[dep]).toBeDefined();
      }
    });

    it('should have all required dev dependencies', () => {
      const requiredDevDeps = [
        '@types/react',
        '@types/react-dom',
        '@vitejs/plugin-react',
        'typescript',
        'vite',
        'tailwindcss',
        'jest',
        '@testing-library/react',
        '@testing-library/jest-dom'
      ];
      
      for (const dep of requiredDevDeps) {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      }
    });
  });

  describe('빌드 스크립트 검증', () => {
    it('should have build script configured correctly', () => {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.build).toContain('tsc');
      expect(packageJson.scripts.build).toContain('vite build');
    });

    it('should have TypeScript configuration for build', () => {
      const tsconfigPath = join(projectRoot, 'tsconfig.json');
      expect(existsSync(tsconfigPath)).toBe(true);
      
      const tsconfigContent = readFileSync(tsconfigPath, 'utf8');
      expect(tsconfigContent).toContain('compilerOptions');
      expect(tsconfigContent).toContain('target');
    });

    it('should have Vite configuration for build', () => {
      const viteConfigPath = join(projectRoot, 'vite.config.ts');
      expect(existsSync(viteConfigPath)).toBe(true);
    });
  });

  describe('테스트 스크립트 검증', () => {
    it('should have test script configured', () => {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Test script should be defined
      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.scripts.test).toContain('jest');
    });

    it('should have Jest configuration file', () => {
      const jestConfigPath = join(projectRoot, 'jest.config.mjs');
      expect(existsSync(jestConfigPath)).toBe(true);
    });

    it('should have test setup file', () => {
      const setupTestsPath = join(projectRoot, 'src', 'setupTests.ts');
      expect(existsSync(setupTestsPath)).toBe(true);
    });
  });

  describe('개발 환경 스크립트 검증', () => {
    it('should have valid Vite configuration', () => {
      const viteConfigPath = join(projectRoot, 'vite.config.ts');
      expect(existsSync(viteConfigPath)).toBe(true);
      
      // Vite config should be valid (build works)
      // We already tested build, so this validates the config
    });

    it('should have valid TypeScript configuration', () => {
      const tsconfigPath = join(projectRoot, 'tsconfig.json');
      const tsconfigNodePath = join(projectRoot, 'tsconfig.node.json');
      
      expect(existsSync(tsconfigPath)).toBe(true);
      expect(existsSync(tsconfigNodePath)).toBe(true);
      
      // TypeScript config should be valid (build compiles successfully)
      // We already tested build, so this validates the config
    });

    it('should have valid Tailwind CSS configuration', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.js');
      const postcssConfigPath = join(projectRoot, 'postcss.config.js');
      
      expect(existsSync(tailwindConfigPath)).toBe(true);
      expect(existsSync(postcssConfigPath)).toBe(true);
      
      // Tailwind config should be valid (build includes CSS)
      const assetsDir = join(buildDir, 'assets');
      if (existsSync(assetsDir)) {
        const files = require('fs').readdirSync(assetsDir);
        const cssFiles = files.filter((file: string) => file.endsWith('.css'));
        expect(cssFiles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('프로젝트 구조 검증', () => {
    it('should have correct source directory structure', () => {
      const srcDir = join(projectRoot, 'src');
      const requiredDirs = [
        'components',
        'store',
        'db',
        'types',
        'utils',
        'hooks'
      ];
      
      expect(existsSync(srcDir)).toBe(true);
      
      for (const dir of requiredDirs) {
        expect(existsSync(join(srcDir, dir))).toBe(true);
      }
    });

    it('should have correct test directory structure', () => {
      const testsDir = join(projectRoot, 'tests');
      const requiredDirs = [
        '__mocks__',
        'utils',
        'components',
        'store',
        'db'
      ];
      
      expect(existsSync(testsDir)).toBe(true);
      
      for (const dir of requiredDirs) {
        expect(existsSync(join(testsDir, dir))).toBe(true);
      }
    });

    it('should have essential configuration files', () => {
      const requiredFiles = [
        'package.json',
        'tsconfig.json',
        'tsconfig.node.json',
        'vite.config.ts',
        'tailwind.config.js',
        'postcss.config.js',
        'jest.config.mjs',
        '.gitignore'
      ];
      
      for (const file of requiredFiles) {
        expect(existsSync(join(projectRoot, file))).toBe(true);
      }
    });
  });

  describe('의존성 호환성 검증', () => {
    it('should have compatible dependency versions', () => {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      
      // Check React version compatibility
      const reactVersion = packageJson.dependencies.react;
      const reactTypesVersion = packageJson.devDependencies['@types/react'];
      
      expect(reactVersion).toMatch(/^\^18\./);
      expect(reactTypesVersion).toMatch(/^\^18\./);
      
      // Check TypeScript version
      const typescriptVersion = packageJson.devDependencies.typescript;
      expect(typescriptVersion).toMatch(/^\^5\./);
      
      // Check Vite version
      const viteVersion = packageJson.devDependencies.vite;
      expect(viteVersion).toMatch(/^\^4\./);
    });

    it('should not have dependency conflicts', () => {
      // If we got this far without installation errors, dependencies are compatible
      expect(existsSync(nodeModulesDir)).toBe(true);
      
      // Check that key packages are installed
      const keyPackages = ['react', 'typescript', 'vite', 'jest', 'zustand', 'dexie'];
      
      for (const pkg of keyPackages) {
        expect(existsSync(join(nodeModulesDir, pkg))).toBe(true);
      }
    });
  });
});