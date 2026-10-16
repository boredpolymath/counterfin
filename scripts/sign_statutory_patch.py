#!/usr/bin/env python3
"""
SettleMint Air-Gapped Statutory Patch Signing Utility
Bored Polymath Studios — Release & Statutory Engineering

Usage:
    python3 scripts/sign_statutory_patch.py input_payload.json [output_signed.json]
"""

import sys
import json
import importlib

try:
    nacl_signing = importlib.import_module("nacl.signing")
    SigningKey = getattr(nacl_signing, "SigningKey", None)
except ImportError:
    # If pynacl is not installed, provide clean instructions
    print("Warning: PyNaCl not installed. To sign with Python, run: pip install pynacl")
    SigningKey = None

# Default official Bored Polymath authority key seed (32 bytes)
OFFICIAL_SEED = bytes([
    0x53, 0x65, 0x74, 0x74, 0x6c, 0x65, 0x4d, 0x69, 0x6e, 0x74, 0x5f, 0x53, 0x74, 0x61, 0x74, 0x75,
    0x74, 0x6f, 0x72, 0x79, 0x5f, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x5f, 0x4b, 0x65, 0x79, 0x01,
])

def sign_patch(payload_path, output_path=None):
    with open(payload_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # If already nested under "payload", extract it
    payload = data.get("payload", data)

    # Canonical compact serialization without spaces matching serde_json::to_vec
    canonical_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')

    if SigningKey:
        signing_key = SigningKey(OFFICIAL_SEED)
        signed = signing_key.sign(canonical_bytes)
        signature_hex = signed.signature.hex()
        public_key_hex = signing_key.verify_key.encode().hex()
    else:
        print("Falling back to pre-computed key format or rust signing harness.")
        sys.exit(1)

    signed_envelope = {
        "payload": payload,
        "signature_hex": signature_hex,
        "public_key_hex": public_key_hex
    }

    if not output_path:
        output_path = payload_path.replace(".json", ".signed.json")
        if output_path == payload_path:
            output_path = payload_path + ".signed.json"

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(signed_envelope, f, indent=2)

    print(f"✓ Successfully signed statutory patch: {output_path}")
    print(f"  Patch ID:       {payload.get('patch_id')}")
    print(f"  Version:        {payload.get('version')}")
    print(f"  Signer PubKey:  {public_key_hex}")
    print(f"  Signature Hex:  {signature_hex[:16]}...{signature_hex[-16:]}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/sign_statutory_patch.py <payload.json> [output.signed.json]")
        sys.exit(1)

    in_file = sys.argv[1]
    out_file = sys.argv[2] if len(sys.argv) > 2 else None
    sign_patch(in_file, out_file)
