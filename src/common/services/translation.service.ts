import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class TranslationService implements OnModuleInit {
  private readonly logger = new Logger(TranslationService.name);
  private translations: Record<string, Record<string, string>> = {};
  private readonly localesPath = path.resolve("./locales");

  onModuleInit() {
    this.preloadTranslations();
  }

  private preloadTranslations() {
    try {
      const languages = fs.readdirSync(this.localesPath);
      for (const lang of languages) {
        const langPath = path.join(this.localesPath, lang);
        if (fs.statSync(langPath).isDirectory()) {
          const filePath = path.join(langPath, "translation.json");
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, "utf-8");
            this.translations[lang] = JSON.parse(content);
            this.logger.log(`Loaded translations for language: ${lang}`);
          }
        }
      }
    } catch (error) {
      this.logger.error("Failed to preload translations", error.stack);
    }
  }

  translate(key: string, language: string = "en"): string {
    const translations = this.translations[language] || this.translations["en"];
    if (!translations) return key;

    let message = key;
    
    // Check if key is a JSON string containing placeholders
    try {
      if (key.startsWith('{') && key.endsWith('}')) {
        const parsed = JSON.parse(key);
        if (parsed && parsed.key) {
          const translation = translations[parsed.key] || parsed.key;
          return this.replacePlaceholders(translation, parsed);
        }
      }
    } catch (e) {
      // Not a JSON string, continue with normal lookup
    }

    const translation = translations[key] || key;
    return translation;
  }

  private replacePlaceholders(text: string, params: Record<string, any>): string {
    return text.replace(/{{(\w+)}}/g, (_, key) => {
      return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
    });
  }
}
