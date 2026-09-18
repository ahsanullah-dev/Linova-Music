import { GlobalMusicProvider } from './GlobalMusicProvider.js';
import { SaavnMusicProvider } from './SaavnMusicProvider.js';
import { MockMusicProvider } from './MockMusicProvider.js';
import { YouTubeMusicProvider } from './YouTubeMusicProvider.js';
import { ENV } from '../../config/env.js';

class ProviderManager {
  constructor() {
    this.globalProvider = new GlobalMusicProvider();
    this.saavnProvider = new SaavnMusicProvider();
    this.mockProvider = new MockMusicProvider();
    this.ytmProvider = new YouTubeMusicProvider();
    this.activeProviderName = ENV.MUSIC_PROVIDER || 'global';
  }

  getProvider(providerName = this.activeProviderName) {
    const key = (providerName || this.activeProviderName).toLowerCase();
    if (key === 'youtube-music' || key === 'ytmusic' || key === 'youtube') {
      return this.ytmProvider;
    }
    if (key === 'saavn' || key === 'jiosaavn') {
      return this.saavnProvider;
    }
    if (key === 'mock') {
      return this.mockProvider;
    }
    return this.globalProvider || this.mockProvider;
  }

  setActiveProvider(name) {
    this.activeProviderName = name;
  }

  async getActiveStatus() {
    const provider = this.getProvider();
    const capabilities = await provider.getCapabilities();
    return {
      activeProvider: provider.name,
      configuredProvider: this.activeProviderName,
      availableProviders: ['global', 'youtube-music', 'saavn', 'mock'],
      capabilities,
      isFallback: provider.name !== this.activeProviderName
    };
  }
}

export const providerManager = new ProviderManager();
export const musicProvider = providerManager.getProvider();
export const getRequestProvider = (req) => {
  const custom = req?.headers?.['x-music-provider'] || req?.query?.provider;
  return providerManager.getProvider(custom);
};
