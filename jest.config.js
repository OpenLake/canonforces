/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"]
};

module.exports = config;