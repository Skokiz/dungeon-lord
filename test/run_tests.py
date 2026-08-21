"""Раннер тестів Dungeon Lord.

Гра — vanilla JS + Canvas без npm і без збірки, вся логіка в глобалях main.html.
Імпортувати її в Node нема як, тому тести виконуються всередині справжньої
сторінки в headless Chromium — тим самим Playwright, що вже стоїть у .venv-video
для рендер-скриптів. Жодних нових залежностей.

Запуск:
    .venv-video\\Scripts\\python.exe test\\run_tests.py

Код виходу: 0 — усі тести пройшли, 1 — є падіння (щоб чіплялось у CI/гейти).
"""

import pathlib
import sys

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent


def main() -> int:
    page_errors = []
    tests_js = (HERE / "tests.js").read_text(encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 400, "height": 800})
        page.on("pageerror", lambda e: page_errors.append(str(e)))

        page.goto((ROOT / "main.html").as_uri())
        page.wait_for_timeout(1500)

        page.add_script_tag(content=tests_js)
        report = page.evaluate("() => __runTests()")

        browser.close()

    failures = [r for r in report["results"] if not r["pass"]]

    for r in report["results"]:
        if not r["pass"]:
            print(f"FAIL  {r['name']}")
            print(f"      {r.get('detail', '')}")

    print()
    print(f"passed: {report['passed']}   failed: {report['failed']}")

    if page_errors:
        print()
        print(f"page errors ({len(page_errors)}):")
        for e in page_errors:
            print("  " + e)

    # Помилка на сторінці означає, що гра впала при завантаженні — зелені тести
    # після цього нічого не варті.
    return 1 if failures or page_errors else 0


if __name__ == "__main__":
    sys.exit(main())
