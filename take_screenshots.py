import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})

        # 1. Home
        print("Capturing Home...")
        await page.goto("https://servi-local2026-web.vercel.app/")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="guias_sistema/figura_8.png")

        # 2. Login
        print("Capturing Login...")
        await page.goto("https://servi-local2026-web.vercel.app/iniciar-sesion")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="guias_sistema/figura_3.png")

        # 3. Register
        print("Capturing Register...")
        await page.goto("https://servi-local2026-web.vercel.app/registrarse")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="guias_sistema/figura_4.png")

        # 4. Catalog
        print("Capturing Catalog...")
        await page.goto("https://servi-local2026-web.vercel.app/servicios")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="guias_sistema/figura_5.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
