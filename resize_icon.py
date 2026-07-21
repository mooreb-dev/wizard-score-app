from PIL import Image
import os

src_path = r"C:\Users\Moore\.gemini\antigravity\brain\3adb7e7e-93d9-475f-8c9e-1ea37a197960\wizard_app_icon_1784648317660.png"
public_dir = r"c:\Users\Moore\antigravity\Wizard Score App\public"

if not os.path.exists(public_dir):
    os.makedirs(public_dir)

with Image.open(src_path) as img:
    # 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(public_dir, "pwa-512x512.png"))
    
    # 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(public_dir, "pwa-192x192.png"))

print("Icons generated successfully!")
