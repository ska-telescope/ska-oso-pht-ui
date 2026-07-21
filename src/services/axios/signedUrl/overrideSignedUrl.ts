import {
  S3_SIGNED_URL_BUCKET_REWRITE_FROM,
  S3_SIGNED_URL_BUCKET_REWRITE_TO,
  S3_SIGNED_URL_OVERRIDE
} from '@utils/constants.ts';

function isAbsoluteHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function overrideSignedUrl(signedUrl: string): string {
  if (!S3_SIGNED_URL_OVERRIDE || !isAbsoluteHttpUrl(signedUrl)) {
    return signedUrl;
  }

  try {
    const originalUrl = new URL(signedUrl);
    const rewrittenPathname = rewriteBucketInPath(originalUrl.pathname);

    if (S3_SIGNED_URL_OVERRIDE.startsWith('/')) {
      const prefix = S3_SIGNED_URL_OVERRIDE.replace(/\/$/, '');
      return `${prefix}${rewrittenPathname}${originalUrl.search}`;
    }

    const overrideUrl = new URL(S3_SIGNED_URL_OVERRIDE);
    const prefixPath = overrideUrl.pathname.replace(/\/$/, '');

    originalUrl.protocol = overrideUrl.protocol;
    originalUrl.username = overrideUrl.username;
    originalUrl.password = overrideUrl.password;
    originalUrl.hostname = overrideUrl.hostname;
    originalUrl.port = overrideUrl.port;
    originalUrl.pathname = `${prefixPath}${rewrittenPathname}`;

    return originalUrl.toString();
  } catch {
    return signedUrl;
  }
}

function rewriteBucketInPath(pathname: string): string {
  if (!S3_SIGNED_URL_BUCKET_REWRITE_FROM || !S3_SIGNED_URL_BUCKET_REWRITE_TO) {
    return pathname;
  }

  const pathSegments = pathname.split('/');
  if (pathSegments.length >= 2 && pathSegments[1] === S3_SIGNED_URL_BUCKET_REWRITE_FROM) {
    pathSegments[1] = S3_SIGNED_URL_BUCKET_REWRITE_TO;
    return pathSegments.join('/');
  }

  return `/${S3_SIGNED_URL_BUCKET_REWRITE_TO}${pathname}`;
}
