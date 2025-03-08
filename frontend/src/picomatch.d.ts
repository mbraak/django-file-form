declare module "picomatch/posix" {
  interface PicomatchOptions {
    /**
     * Make matching case-insensitive.
     */
    nocase?: boolean;
  }

  function isMatch(
    str: string,
    patterns: string | string[],
    options?: PicomatchOptions
  ): boolean;
}
