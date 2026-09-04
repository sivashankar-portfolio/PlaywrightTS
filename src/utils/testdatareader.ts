import * as fs from 'fs';
import { TEST_DATA_PATH } from '../constants/constants.js';

const testDataPath = TEST_DATA_PATH;

/**
 * Returns a string value for the given key from the test data file.
 */
export function getTestData(key: string): string {
  return getValue(key);
}

/**
 * Returns a plain JSON object (not an array) for the given key.
 */
export function getJsonObject(key: string): Record<string, any> {
  const value = getValue(key);

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Key "${key}" does not contain a JSON object`);
  }

  return value;
}

/**
 * Returns a JSON array for the given key.
 */
export function getJsonArray(key: string): any[] {
  const value = getValue(key);

  if (!Array.isArray(value)) {
    throw new Error(`Key "${key}" does not contain a JSON array`);
  }

  return value;
}

// Shared lookup used by all getters above so the "key exists" check lives in one place.
function getValue(key: string): any {
  const testData = loadTestData();

  if (!(key in testData)) {
    throw new Error(`Key "${key}" not found in test data`);
  }

  return testData[key];
}

function loadTestData(): any {
  if (!fs.existsSync(testDataPath)) {
    throw new Error(`The path does not exist ${testDataPath}`);
  }

  const rawData: string = fs.readFileSync(testDataPath, 'utf-8');
  return JSON.parse(rawData);
}
