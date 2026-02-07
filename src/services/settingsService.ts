// Settings Service — CRUD for persisting user settings to Supabase
//
// On load  → fetch from DB, merge into Zustand store
// On save  → push Zustand state to DB
// API keys are stored encrypted-at-rest by Supabase (RLS open, firebase_uid filter in app)

import { supabase } from '@/integrations/supabase/client';
import { useSettingsStore, type AIProviderConfig } from '@/store/settingsStore';

export interface UserSettingsRow {
  id: string;
  firebase_uid: string;
  ai_provider: string;
  ai_providers: any; // JSONB
  ai_max_tokens: number;
  ai_temperature: number;
  editor_settings: any;
  theme_settings: any;
  mcp_settings: any;
  created_at: string;
  updated_at: string;
}

// ── Load settings from DB and merge into Zustand ──
export async function loadUserSettings(firebaseUid: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_settings' as any)
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    if (error) {
      console.error('Failed to load user settings:', error);
      return false;
    }

    if (!data) {
      // No settings in DB yet — user will use defaults (Zustand/localStorage)
      return false;
    }

    const row = data as unknown as UserSettingsRow;
    const store = useSettingsStore.getState();

    // Merge AI provider settings from DB into Zustand
    // DB providers override local ones by matching on provider id
    const dbProviders = (row.ai_providers || []) as Array<{
      id: string;
      apiKey: string;
      selectedModel: string;
      enabled: boolean;
    }>;

    if (dbProviders.length > 0) {
      const mergedProviders: AIProviderConfig[] = store.ai.providers.map(localProvider => {
        const dbMatch = dbProviders.find(d => d.id === localProvider.id);
        if (dbMatch) {
          return {
            ...localProvider,
            apiKey: dbMatch.apiKey || localProvider.apiKey,
            selectedModel: dbMatch.selectedModel || localProvider.selectedModel,
            enabled: dbMatch.enabled ?? localProvider.enabled,
          };
        }
        return localProvider;
      });

      store.setAI({
        defaultProvider: row.ai_provider || store.ai.defaultProvider,
        providers: mergedProviders,
        maxTokens: row.ai_max_tokens ?? store.ai.maxTokens,
        temperature: row.ai_temperature ?? store.ai.temperature,
      });
    } else {
      store.setAI({
        defaultProvider: row.ai_provider || store.ai.defaultProvider,
        maxTokens: row.ai_max_tokens ?? store.ai.maxTokens,
        temperature: row.ai_temperature ?? store.ai.temperature,
      });
    }

    // Merge theme settings if present in DB
    if (row.theme_settings && typeof row.theme_settings === 'object' && Object.keys(row.theme_settings).length > 0) {
      store.setTheme(row.theme_settings);
    }

    // Merge editor settings if present in DB
    if (row.editor_settings && typeof row.editor_settings === 'object' && Object.keys(row.editor_settings).length > 0) {
      store.setEditor(row.editor_settings);
    }

    return true;
  } catch (err) {
    console.error('Failed to load user settings:', err);
    return false;
  }
}

// ── Save current Zustand settings to DB ──
export async function saveUserSettings(firebaseUid: string): Promise<boolean> {
  try {
    const { ai, theme, editor, mcp } = useSettingsStore.getState();

    // Only persist the mutable parts of providers (api keys, selected model, enabled)
    const providersToSave = ai.providers.map(p => ({
      id: p.id,
      apiKey: p.apiKey,
      selectedModel: p.selectedModel,
      enabled: p.enabled,
    }));

    const payload = {
      firebase_uid: firebaseUid,
      ai_provider: ai.defaultProvider,
      ai_providers: providersToSave,
      ai_max_tokens: ai.maxTokens,
      ai_temperature: ai.temperature,
      editor_settings: editor,
      theme_settings: theme,
      mcp_settings: {
        enabled: mcp.enabled,
        autoIndex: mcp.autoIndex,
        indexOnSave: mcp.indexOnSave,
        contextDepth: mcp.contextDepth,
        excludePatterns: mcp.excludePatterns,
      },
    };

    const { error } = await supabase
      .from('user_settings' as any)
      .upsert(payload as any, { onConflict: 'firebase_uid' });

    if (error) {
      console.error('Failed to save user settings:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to save user settings:', err);
    return false;
  }
}

// ── Delete user settings from DB ──
export async function deleteUserSettings(firebaseUid: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_settings' as any)
      .delete()
      .eq('firebase_uid', firebaseUid);

    if (error) {
      console.error('Failed to delete user settings:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete user settings:', err);
    return false;
  }
}
