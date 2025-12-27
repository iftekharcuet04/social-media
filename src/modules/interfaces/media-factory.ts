interface IMedia {
  post(): Promise<{ id: string | null; error: any }>;
}
