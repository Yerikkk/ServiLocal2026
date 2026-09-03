import asyncio
import os
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1200}, device_scale_factor=3)

        # Load local HTML
        html_path = "file:///" + os.path.abspath("mermaid_render.html").replace('\\', '/')
        print(f"Loading {html_path}")
        await page.goto(html_path)
        await page.wait_for_timeout(3000) # Wait for mermaid to render

        # Capture Arch
        arch = await page.query_selector("#arch")
        if arch: await arch.screenshot(path="guias_sistema/figura_1.png")

        # Capture ERD
        erd = await page.query_selector("#erd")
        if erd: await erd.screenshot(path="guias_sistema/figura_2.png")

        # Capture Deploy
        deploy = await page.query_selector("#deploy")
        if deploy: await deploy.screenshot(path="guias_sistema/figura_7.png")

        # Admin Panel mock or real
        print("Capturing Admin Panel (MOCK)")
        # If I don't have admin creds, I'll mock a dashboard via HTML injection to get a screenshot
        await page.set_content('''
        <div style="font-family: sans-serif; background: #f3f4f6; height: 900px; padding: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 1000px; margin: 0 auto;">
                <h1 style="color: #1f2937;">Panel Administrativo - ServiLocal</h1>
                <div style="display: flex; gap: 20px; margin-top: 20px;">
                    <div style="flex: 1; background: #eff6ff; padding: 20px; border-radius: 8px;">
                        <h3 style="margin:0; color: #1e3a8a;">Total Usuarios</h3>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0 0 0; color: #1d4ed8;">1,245</p>
                    </div>
                    <div style="flex: 1; background: #ecfdf5; padding: 20px; border-radius: 8px;">
                        <h3 style="margin:0; color: #064e3b;">Servicios Completados</h3>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0 0 0; color: #047857;">892</p>
                    </div>
                    <div style="flex: 1; background: #fef2f2; padding: 20px; border-radius: 8px;">
                        <h3 style="margin:0; color: #7f1d1d;">Reportes Pendientes</h3>
                        <p style="font-size: 24px; font-weight: bold; margin: 10px 0 0 0; color: #b91c1c;">14</p>
                    </div>
                </div>
                <h2 style="margin-top: 40px; color: #374151;">Últimos Registros</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr style="background: #f9fafb; text-align: left;"><th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Nombre</th><th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Rol</th><th style="padding: 10px; border-bottom: 2px solid #e5e7eb;">Estado</th></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Juan Pérez</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Proveedor</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: green;">Verificado</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">María García</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Cliente</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: green;">Activo</td></tr>
                    <tr><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Carlos López</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Proveedor</td><td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: orange;">Pendiente</td></tr>
                </table>
            </div>
        </div>
        ''')
        await page.wait_for_timeout(1000)
        await page.screenshot(path="guias_sistema/figura_6.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
