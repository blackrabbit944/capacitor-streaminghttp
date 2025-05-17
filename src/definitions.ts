export interface StreamingHttpPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
