import { RepositoryAnalysis, SandboxSettings } from "@/types";
import { MOCK_REPOSITORIES, DEFAULT_SETTINGS } from "@/constants";

export interface StorageServiceInterface {
  getScanHistory(): RepositoryAnalysis[];
  saveScanToHistory(scan: RepositoryAnalysis): void;
  deleteScanFromHistory(id: string): void;
  getActiveScan(): RepositoryAnalysis | null;
  setActiveScan(scan: RepositoryAnalysis): void;
  getSettings(): SandboxSettings;
  saveSettings(settings: SandboxSettings): void;
}

export class StorageService implements StorageServiceInterface {
  private static SCANS_KEY = "devpilot_scans";
  private static ACTIVE_SCAN_KEY = "devpilot_active_scan";
  private static SETTINGS_KEY = "devpilot_settings";

  getScanHistory(): RepositoryAnalysis[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(StorageService.SCANS_KEY);
      if (!stored) {
        localStorage.setItem(StorageService.SCANS_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("StorageService: Failed to parse scan history", e);
      return [];
    }
  }

  saveScanToHistory(scan: RepositoryAnalysis): void {
    if (typeof window === "undefined") return;
    try {
      const scans = this.getScanHistory();
      const index = scans.findIndex((s) => s.repoUrl.toLowerCase() === scan.repoUrl.toLowerCase());
      if (index >= 0) {
        scans[index] = { ...scan, scannedAt: new Date().toISOString() };
      } else {
        scans.unshift({ ...scan, id: String(Date.now()) });
      }
      localStorage.setItem(StorageService.SCANS_KEY, JSON.stringify(scans));
    } catch (e) {
      console.error("StorageService: Failed to save scan", e);
    }
  }

  deleteScanFromHistory(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const scans = this.getScanHistory();
      const filtered = scans.filter((s) => s.id !== id);
      localStorage.setItem(StorageService.SCANS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error("StorageService: Failed to delete scan", e);
    }
  }

  getActiveScan(): RepositoryAnalysis | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(StorageService.ACTIVE_SCAN_KEY);
      if (!stored) {
        const history = this.getScanHistory();
        return history.length > 0 ? history[0] : null;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("StorageService: Failed to get active scan", e);
      return null;
    }
  }

  setActiveScan(scan: RepositoryAnalysis): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(StorageService.ACTIVE_SCAN_KEY, JSON.stringify(scan));
    } catch (e) {
      console.error("StorageService: Failed to set active scan", e);
    }
  }

  getSettings(): SandboxSettings {
    if (typeof window === "undefined") return { ...DEFAULT_SETTINGS, isGitHubConnected: false };
    try {
      const stored = localStorage.getItem(StorageService.SETTINGS_KEY);
      if (!stored) {
        const initial = { ...DEFAULT_SETTINGS, isGitHubConnected: false };
        localStorage.setItem(StorageService.SETTINGS_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error("StorageService: Failed to get settings", e);
      return { ...DEFAULT_SETTINGS, isGitHubConnected: false };
    }
  }

  saveSettings(settings: SandboxSettings): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(StorageService.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("StorageService: Failed to save settings", e);
    }
  }
}

export const storageService = new StorageService();
export default storageService;
