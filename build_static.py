"""Gera a versão estática publicada pelo Netlify."""

from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "dist"


def copy_directory(source: Path, destination: Path) -> None:
    shutil.copytree(source, destination)


def build() -> None:
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)

    OUTPUT.mkdir()
    shutil.copy2(ROOT / "templates" / "index.html", OUTPUT / "index.html")
    copy_directory(ROOT / "static", OUTPUT / "static")
    copy_directory(ROOT / "templates" / "images", OUTPUT / "images")

    data_directory = OUTPUT / "data"
    data_directory.mkdir()
    shutil.copy2(ROOT / "config" / "instrument.json", data_directory / "instrument.json")

    print(f"Site estático gerado em {OUTPUT}")


if __name__ == "__main__":
    build()
