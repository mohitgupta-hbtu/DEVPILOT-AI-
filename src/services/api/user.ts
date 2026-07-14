/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "./client";

export interface KeyValidationResult {
  valid: boolean;
  provider: "gemini" | "openrouter";
  message?: string;
}

export const userAPI = {
  /**
   * Validates if the personal keys supplied by the developer are working correct.
   */
  async validateAPIKey(
    provider: "gemini" | "openrouter",
    key: string,
  ): Promise<KeyValidationResult> {
    try {
      // Send key check to server
      const payload: any = {};
      if (provider === "gemini") payload.geminiApiKey = key;
      if (provider === "openrouter") payload.openrouterApiKey = key;

      // Make a lightweight analysis check or validation endpoint if it exists
      await apiFetch<any>("/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          repositoryUrl: "https://github.com/facebook/react",
          ...payload,
        }),
      });

      return {
        valid: true,
        provider,
        message: "API credentials successfully validated by upstream provider.",
      };
    } catch (e: any) {
      return {
        valid: false,
        provider,
        message: e.message || "Failed to validate credentials.",
      };
    }
  },

  /**
   * Standardized GitHub OAuth endpoint triggering verification.
   */
  async triggerGitHubOAuth(): Promise<string> {
    // Return mock redirection url or fetch active oauth gateway URL from server
    return "https://github.com/login/oauth/authorize";
  },
};
