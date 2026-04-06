# Known Limitations

## Sites That Block Nothing Browser

Google properties (Search, Gmail, YouTube via browser), Facebook, and banking sites **will block or degrade** functionality. These sites use advanced browser fingerprinting that goes beyond what Nothing Browser currently spoofs.

This is expected. Nothing Browser is not designed to bypass Google's bot detection in v0.1.x. Use the YOUTUBE tab for YouTube — it bypasses this entirely via NewPipe Extractor.

## No Chrome Extensions

Chrome extensions are not supported. Qt WebEngine does not have an extension host.

## Fingerprint Spoofing ≠ Anonymity

Fingerprint spoofing reduces tracking entropy. It does not make you invisible. Use a VPN separately if anonymity matters. Do not store sensitive data in Nothing Browser.

## Captcha Solver

No captcha solver in v0.1.x. Coming in v0.3.0 (reCAPTCHA v2/v3, hCaptcha).

## Auto-Update and .deb Install

If installed via `.deb` to `/usr/bin`, the auto-updater requires `pkexec` or `sudo` to replace the binary. Use the `tar.gz` release for seamless in-app updates.

## YouTube Tab Requires Java

The YOUTUBE tab uses the NewPipe Extractor JAR bridge. Java 17+ must be installed. If Java is not found, the tab shows a status error.

## Canvas Uniqueness

Canvas fingerprint uniqueness is currently 99.98%. The sin() PRNG is being replaced with xorshift in v0.2.0 to reduce this.

## TLS Limitations (Qt WebEngine)

- X25519MLKEM768 curve: requires Qt WebEngine version bump (v0.3.0+)
- Encrypted Client Hello (ECH): Chrome 119+ feature, requires custom Qt build
- ALPS codepoint 17613: Chrome 133+ only, current Qt ships 17513

None of these affect detection by current Cloudflare, Akamai, or DataDome for Chrome 124 impersonation.
