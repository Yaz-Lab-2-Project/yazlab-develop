#!/usr/bin/env python
"""
AcademicPortal - Frontend ve Backend'i aynı porttan çalıştırmak için script
"""

import os
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Komutu çalıştır ve çıktıyı göster"""
    process = subprocess.Popen(
        command,
        cwd=cwd,
        shell=shell,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    # Çıktıyı gerçek zamanlı olarak göster
    for line in process.stdout:
        print(line, end='')
    
    return process

def main():
    # Proje kök dizinini bul
    root_dir = Path(__file__).parent.absolute()
    frontend_dir = root_dir / 'frontend'
    backend_dir = root_dir / 'backend'
    
    print("=" * 80)
    print("AcademicPortal - Frontend ve Backend'i aynı porttan çalıştırma")
    print("=" * 80)
    
    # Frontend build işlemi
    print("\n1. Frontend build işlemi başlatılıyor...")
    build_cmd = "npm run build"
    build_process = run_command(build_cmd, cwd=frontend_dir)
    build_process.wait()
    
    if build_process.returncode != 0:
        print("Frontend build işlemi başarısız oldu!")
        sys.exit(1)
    
    print("\nFrontend build işlemi tamamlandı.")
    
    # Backend'i başlat
    print("\n2. Backend sunucusu başlatılıyor...")
    backend_cmd = "python manage.py runserver 0.0.0.0:8000"
    backend_process = run_command(backend_cmd, cwd=backend_dir)
    
    # Tarayıcıyı aç
    print("\n3. Tarayıcı açılıyor...")
    time.sleep(2)  # Sunucunun başlaması için bekle
    webbrowser.open("http://localhost:8000")
    
    try:
        # Backend sürecini çalışır durumda tut
        backend_process.wait()
    except KeyboardInterrupt:
        print("\nSunucu kapatılıyor...")
        backend_process.terminate()
        backend_process.wait()
        print("Sunucu kapatıldı.")

if __name__ == "__main__":
    main() 