#!/usr/bin/env python3
import os
import base64

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Minimal valid PNG base64 data (1x1 blue pixel)
icon_data = base64.b64decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8//8/AwAI/AL+jfub0gAAAABJRU5ErkJggg=='
)

# Create icons in different sizes (we'll use the same pixel data, just name them differently)
for size in [16, 48, 128]:
    filename = f'icons/icon{size}.png'
    with open(filename, 'wb') as f:
        f.write(icon_data)
    print(f'Created {filename}')
