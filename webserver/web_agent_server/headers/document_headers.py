from typing import Any

from django.conf import settings


class DocumentHeaders():
    def __init__(self) -> None:
        # Multiple CSPs are added by a different middleware.
        self.__headers: dict[str, Any] = {
            "Report-To": {
                "group": "default",
                "max_age": 10886400,
                "endpoints":
                    [
                        {
                            "url": f"{settings.CSP_ENDPOINT}"
                        }
                    ],
                "include_subdomains": "true"
            },
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Resource-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Vary": "Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site, Sec-Fetch-User",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "SAMEORIGIN",
            "X-XSS-Protection": "1; mode=block", # TODO: is this still worth it? Only Safari supports it, and it is notoriously unreliable.
            "Permissions-Policy": "accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), sync-xhr=(), usb=(), xr-spatial-tracking=()",
            "Referrer-Policy": "same-origin",
            "Server": "Web-Agent",
            "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

            # TODO: uncomment when served over HTTPS with a real certificate.
            # "Expect-CT": "enforce, max-age=63072000, report-uri=\"/expect-ct-endpoint\"",

            # TODO: keep an eye on `report-to` support in Firefox and bugfixes in Chromium, so that `report-uri` can be replaced by `report-to`.
            # TODO: keep an eye on TypeScript support for non-string values in DOM sinks. so that this CSP can be enforced.
            # `report-uri` is deprecated, but `report-to` is broken in Chromium (see https://bugs.chromium.org/p/chromium/issues/detail?id=1098885), and not supported by Firefox.
            # Also, see the comment above regarding `require-trusted-types-for` and TypeScript.
            "Content-Security-Policy-Report-Only": f"require-trusted-types-for 'script'; report-uri {settings.CSP_ENDPOINT};"
        }

    def get_headers(self) -> dict[str, Any]:
        return self.__headers
