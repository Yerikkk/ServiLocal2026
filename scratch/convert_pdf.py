import asyncio
from playwright.async_api import async_playwright
import os
from pathlib import Path

async def generate_pdf():
    # Convert absolute path to file URI for Playwright
    html_file = Path(r"c:\Proyectos2026\ServiLocal2026\scratch\ficha.html").absolute().as_uri()
    pdf_path = r"c:\Proyectos2026\ServiLocal2026\guias_sistema\Ficha_Ejecutiva_ServiLocal2026.pdf"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print(f"Loading HTML: {html_file}")
        await page.goto(html_file)
        
        # Wait a bit to ensure images are fully loaded and rendered
        await page.wait_for_timeout(2000)
        
        # We can also inject print CSS specifically or trust our @page definitions
        print("Generating PDF...")
        await page.pdf(
            path=pdf_path, 
            format="A4", 
            print_background=True,
            display_header_footer=False,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}
        )
        
        await browser.close()
        print(f"PDF generado exitosamente en: {pdf_path}")

if __name__ == '__main__':
    asyncio.run(generate_pdf())
