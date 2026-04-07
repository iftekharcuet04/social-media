export interface PlatformCapability {
  canPost: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

export const platformCapabilities: Record<string, PlatformCapability> = {
  instagram: { canPost: true, canDelete: false, canEdit: false },
  facebook: { canPost: true, canDelete: true, canEdit: false },
  linkedin: { canPost: true, canDelete: false, canEdit: false },
};
