import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

export default config;