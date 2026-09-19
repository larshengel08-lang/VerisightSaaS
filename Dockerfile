# Backend-image voor Railway.
#
# Waarom geen Nixpacks meer (besluit 2026-09-19): WeasyPrint laadt pango en
# gobject via dlopen. Onder Nixpacks komt Python uit de nix-store, en die
# lader doorzoekt /usr/lib niet; met nixPkgs vond hij de libs niet (16-9) en
# met aptPkgs ook niet (18-9). Elke rapportdownload gaf daardoor live een 500.
# Dit is dezelfde Debian-basis waarop de render lokaal wel bewezen werkt, en
# de build faalt luid als de renderer niet laadt (zie de RUN onderaan).
#
# Python 3.11: gelijk aan de lokale .venv en aan wat Railway al draaide.
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# De door WeasyPrint gedocumenteerde set voor Debian. libpango trekt
# libglib2.0-0 mee, die libgobject-2.0.so.0 levert. fonts-dejavu-core is de
# terugval voor tekens buiten de ingebedde rapportfonts. libharfbuzz-subset0
# is wat WeasyPrint 70 gebruikt om de ingebedde fonts te subsetten; zonder
# valt hij terug op fontTools met een waarschuwing per font.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      libpango-1.0-0 \
      libpangoft2-1.0-0 \
      libharfbuzz0b \
      libharfbuzz-subset0 \
      libgdk-pixbuf-2.0-0 \
      libcairo2 \
      libffi8 \
      shared-mime-info \
      fontconfig \
      fonts-dejavu-core \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY backend ./backend
COPY templates ./templates

# Fail Loud: een image waarin de PDF-renderer niet werkt mag niet bestaan.
# Dit rendert een echte PDF tijdens de build; mislukt dat, dan mislukt de
# deploy en blijft de vorige versie draaien.
RUN python -c "import weasyprint; pdf = weasyprint.HTML(string='<p>Loep</p>').write_pdf(); assert pdf[:4] == b'%PDF', 'geen PDF'"

# Shell-vorm, zodat $PORT van Railway wordt ingevuld.
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
