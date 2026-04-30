import { describe, expect, it } from 'vitest';
import { classifyProxyBaseUrl } from '../src/server.js';

describe('proxy base URL policy', () => {
  it('allows osmAPI hosted endpoints', () => {
    expect(classifyProxyBaseUrl('https://osmapi.com/v1')).toMatchObject({
      allowed: true,
      kind: 'osm',
      requiresApiKey: true,
    });
    expect(classifyProxyBaseUrl('https://api.osmapi.com')).toMatchObject({
      allowed: true,
      kind: 'osm',
      requiresApiKey: true,
    });
  });

  it('allows local OpenAI-compatible servers without requiring an API key', () => {
    expect(classifyProxyBaseUrl('http://localhost:11434/v1')).toMatchObject({
      allowed: true,
      kind: 'local',
      requiresApiKey: false,
    });
    expect(classifyProxyBaseUrl('http://127.0.0.1:1234/v1')).toMatchObject({
      allowed: true,
      kind: 'local',
      requiresApiKey: false,
    });
    expect(classifyProxyBaseUrl('http://192.168.1.20:1234/v1')).toMatchObject({
      allowed: true,
      kind: 'local',
      requiresApiKey: false,
    });
  });

  it('rejects arbitrary external AI providers', () => {
    expect(classifyProxyBaseUrl('https://api.vendor.example')).toMatchObject({
      allowed: false,
      reason: 'Only osmAPI.com and local AI server endpoints are allowed',
    });
    expect(classifyProxyBaseUrl('https://api.openai.com/v1')).toMatchObject({
      allowed: false,
      reason: 'Only osmAPI.com and local AI server endpoints are allowed',
    });
  });
});
