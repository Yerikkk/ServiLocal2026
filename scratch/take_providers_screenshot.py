import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        
        print("Capturing Proveedores...")
        await page.goto("https://servi-local2026-web.vercel.app/proveedores")
        # Wait 4 seconds for data to fetch
        await page.wait_for_timeout(4000)
        await page.screenshot(path="guias_sistema/figura_proveedores.png")

        await browser.close()
        print("Done capturing Proveedores!")

if __name__ == "__main__":
    asyncio.run(run())
