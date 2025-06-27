#!/usr/bin/env python3
import base64
import json
from nacl import encoding, public

# Repository public key from GitHub API
public_key = "wyKjHpPZbeXPKffoNsu/nIx+VzANH2icgUQEeHD29nI="
key_id = "3380204578043523366"

# Azure deployment token
secret_value = "e70ed20d781eafb1ebacc105c07397443240adca20098ae37acd0b0697b6fd6d01-799e9b5f-4f25-46dd-9185-cc248d14322000f29280e9094f0f"

# Encrypt the secret
public_key_bytes = base64.b64decode(public_key)
public_key_obj = public.PublicKey(public_key_bytes)
box = public.SealedBox(public_key_obj)
encrypted = box.encrypt(secret_value.encode('utf-8'))
encrypted_value = base64.b64encode(encrypted).decode('utf-8')

print(json.dumps({
    "encrypted_value": encrypted_value,
    "key_id": key_id
}))