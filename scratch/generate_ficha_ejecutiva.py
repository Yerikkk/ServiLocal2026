import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.platypus import Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

def create_ficha_ejecutiva():
    output_dir = r"c:\Proyectos2026\ServiLocal2026\output\pdf"
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, "Ficha_Ejecutiva_ServiLocal2026.pdf")
    
    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=2.5*cm, leftMargin=2.5*cm,
        topMargin=2.5*cm, bottomMargin=2.5*cm
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor("#1e3a8a"),  # Corporate blue
        alignment=1, # Center
        spaceAfter=14
    )
    
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor("#334155"),
        alignment=1,
        spaceAfter=12
    )
    
    normal_style = ParagraphStyle(
        'NormalStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.HexColor("#1e293b"),
        alignment=4, # Justify
        spaceAfter=10,
        leading=14
    )
    
    normal_center = ParagraphStyle(
        'NormalCenter',
        parent=normal_style,
        alignment=1
    )
    
    heading_style = ParagraphStyle(
        'HeadingStyle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor("#1e3a8a"),
        spaceBefore=14,
        spaceAfter=10
    )

    qr_style = ParagraphStyle(
        'QRStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor("#64748b"),
        alignment=1
    )

    elements = []

    # ---------------- PAGE 1: Carátula Institucional ----------------
    logo_path = r"c:\Proyectos2026\ServiLocal2026\guias_sistema\Hola.png"
    if os.path.exists(logo_path):
        from reportlab.lib.utils import ImageReader
        img_reader = ImageReader(logo_path)
        img_w, img_h = img_reader.getSize()
        target_width = 8 * cm
        target_height = (img_h / img_w) * target_width
        logo = Image(logo_path, width=target_width, height=target_height)
        logo.hAlign = 'CENTER'
        elements.append(logo)
    else:
        elements.append(Paragraph("[LOGO: Hola.png no encontrado]", normal_center))
    
    elements.append(Spacer(1, 1.5*cm))
    elements.append(Paragraph("IESTP Luciano Castillo Colonna", title_style))
    elements.append(Spacer(1, 1*cm))
    
    elements.append(Paragraph("DEMODAY - PITCH DE INNOVACIÓN TECNOLÓGICA", subtitle_style))
    elements.append(Spacer(1, 0.5*cm))
    elements.append(Paragraph("FICHA EJECUTIVA DEL PROYECTO", title_style))
    elements.append(Spacer(1, 2*cm))
    
    elements.append(Paragraph("<b>Nombre del Proyecto:</b>", normal_center))
    elements.append(Paragraph("ServiLocal 2026 - Plataforma de Conexión y Gestión de Servicios Locales", subtitle_style))
    elements.append(Spacer(1, 1.5*cm))
    
    # Datos del equipo
    team_data = [
        ["Integrantes:", "1- Yerik Joshua Martínez Guerrero\n2- Eduardo Antonio Álvarez Álvarez\n3- Jesua Ramírez Chira"],
        ["Programa de Estudios:", "Desarrollo de Sistemas de Información"],
        ["Semestre/Ciclo:", "V Ciclo"],
        ["Fecha:", "13 de Julio de 2026"]
    ]
    
    t = Table(team_data, colWidths=[5.5*cm, 9.5*cm])
    t.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('ALIGN', (0,0), (0,-1), 'RIGHT'),
        ('ALIGN', (1,0), (1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#1e293b")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    elements.append(t)
    
    # ---------------- PAGE 2: Ficha Ejecutiva - Parte 1 ----------------
    elements.append(PageBreak())
    
    header_data = [
        [Paragraph("<b>Proyecto:</b> ServiLocal 2026 - Plataforma de Conexión de Servicios", normal_style)],
        [Paragraph("<b>Equipo:</b> Y. Martínez, E. Álvarez, J. Ramírez", normal_style)]
    ]
    header_table = Table(header_data, colWidths=[15*cm])
    header_table.setStyle(TableStyle([
        ('LINEBELOW', (0,1), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 1*cm))
    
    elements.append(Paragraph("7. Descripción del Proyecto", heading_style))
    desc_text = "<b>ServiLocal 2026</b> es un ecosistema digital web diseñado estratégicamente para conectar a proveedores de oficios (plomeros, electricistas, técnicos, etc.) con clientes locales. Su propósito principal es resolver la falta de confianza en la contratación de servicios mediante un entorno seguro. La plataforma integra gestión transaccional integral, chat bidireccional en tiempo real y un robusto sistema de reputación (Trust Score), garantizando fiabilidad y agilidad en cada interacción."
    elements.append(Paragraph(desc_text, normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("8. Público Objetivo", heading_style))
    elements.append(Paragraph("<b>Clientes:</b> Personas y hogares en una zona geográfica determinada que necesitan servicios técnicos rápidos y confiables.", normal_style))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph("<b>Proveedores:</b> Profesionales independientes y pequeños negocios locales que buscan digitalizar su oferta de forma segura.", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("9. Tecnologías Utilizadas", heading_style))
    tech_data = [
        ["Frontend:", "Next.js 16, React 19, TailwindCSS"],
        ["Backend:", "Monolito Modular con NestJS 11"],
        ["Base de Datos:", "PostgreSQL 16, Prisma ORM, Redis"],
        ["Tiempo Real:", "WebSockets / Socket.IO"]
    ]
    tech_table = Table(tech_data, colWidths=[4*cm, 11*cm])
    tech_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#1e293b")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(tech_table)
    
    # ---------------- PAGE 3: Ficha Ejecutiva - Parte 2 ----------------
    elements.append(PageBreak())
    
    elements.append(header_table)
    elements.append(Spacer(1, 1*cm))
    
    elements.append(Paragraph("10. Estado Actual", heading_style))
    status_text = "El sistema se encuentra en estado de <b>MVP Funcional / Prototipo Avanzado</b>. Cuenta con módulos completos de autenticación, chat en tiempo real, gestión de solicitudes y paneles diferenciados (cliente / proveedor / admin). El núcleo fue probado con testing E2E (Playwright) para máxima estabilidad."
    elements.append(Paragraph(status_text, normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    elements.append(Paragraph("11. Innovación Propuesta", heading_style))
    innov1 = "<b>• Trust Score:</b> Algoritmo automatizado que otorga o resta puntos según el comportamiento del usuario y penaliza la inactividad de forma autónoma mediante tareas cron."
    innov2 = "<b>• Arquitectura Escalable:</b> Diseño modular robusto (NestJS) preparado para escalar y transicionar a microservicios a medida que la plataforma crezca."
    elements.append(Paragraph(innov1, normal_style))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(innov2, normal_style))
    elements.append(Spacer(1, 1*cm))
    
    elements.append(Paragraph("12. Accesos del Sistema", heading_style))
    
    url_text = "<b>URL Oficial:</b> <font color='#2563eb'><u>https://servi-local2026-web.vercel.app/</u></font>"
    
    qr_data = [[Paragraph("<br/><br/>[INSERTAR_IMAGEN_CODIGO_QR_AQUI]<br/><br/>", qr_style)]]
    qr_table = Table(qr_data, colWidths=[5.5*cm], rowHeights=[5.5*cm])
    qr_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#94a3b8")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    access_layout = [
        [Paragraph(url_text, normal_center)],
        [Spacer(1, 0.5*cm)],
        [qr_table]
    ]
    
    access_table = Table(access_layout, colWidths=[15*cm])
    access_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(access_table)
    
    doc.build(elements)
    print(f"PDF generado exitosamente en: {file_path}")

if __name__ == '__main__':
    create_ficha_ejecutiva()
