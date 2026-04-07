export interface PlatformCapability {
  canDelete: boolean;
}

export const platformCapabilities: Record<string, PlatformCapability> = {
  instagram: { canDelete: false },
  facebook: { canDelete: true },
  linkedin: { canDelete: false },
};
