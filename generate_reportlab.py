import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Flowable

class StartContent(Flowable):
    def __init__(self):
        Flowable.__init__(self)
        self.width = 0
        self.height = 0
    def draw(self):
        self.canv.is_content = True
        if getattr(self.canv, 'content_start_page', None) is None:
            self.canv.content_start_page = self.canv._pageNumber

class MyDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if flowable.__class__.__name__ == 'Paragraph':
            style_name = flowable.style.name
            if style_name in ['SectionHeader', 'SubHeader']:
                level = 0 if style_name == 'SectionHeader' else 1
                start = getattr(self.canv, 'content_start_page', None)
                if not start:
                    start = self.page
                self.notify('TOCEntry', (level, flowable.getPlainText(), self.page - start + 1))

def create_pdf():
    doc = MyDocTemplate("guias_sistema/ServiLocal_Documento_Tecnico.pdf", pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    Story = []
    
    styles = getSampleStyleSheet()
    
    # Custom Styles (Academic / Professional Norms)
    styles.add(ParagraphStyle(name='TitlePage', parent=styles['Heading1'], fontSize=22, alignment=1, spaceAfter=20, textColor=colors.HexColor('#1e40af')))
    styles.add(ParagraphStyle(name='SubTitle', parent=styles['Heading2'], fontSize=16, alignment=1, spaceAfter=40, textColor=colors.HexColor('#2563eb')))
    
    styles.add(ParagraphStyle(name='TOCHeader', parent=styles['Heading1'], fontSize=16, spaceBefore=20, spaceAfter=15, textColor=colors.HexColor('#1e40af')))
    styles.add(ParagraphStyle(name='SectionHeader', parent=styles['Heading1'], fontSize=16, spaceBefore=24, spaceAfter=12, textColor=colors.HexColor('#1e40af')))
    styles.add(ParagraphStyle(name='SubHeader', parent=styles['Heading2'], fontSize=14, spaceBefore=12, spaceAfter=8, textColor=colors.HexColor('#2563eb')))
    styles.add(ParagraphStyle(name='CustomBodyText', parent=styles['Normal'], fontSize=12, spaceAfter=12, leading=18, alignment=4)) # Justified, 1.5 line spacing
    styles.add(ParagraphStyle(name='CustomBulletText', parent=styles['Normal'], fontSize=12, spaceAfter=8, leading=18, leftIndent=20, alignment=4))
    styles.add(ParagraphStyle(name='ImageCaption', parent=styles['Italic'], fontSize=10, alignment=1, spaceBefore=8, spaceAfter=24, textColor=colors.dimgray))

    # PORTADA
    if os.path.exists("guias_sistema/Hola.png"):
        img = Image("guias_sistema/Hola.png", width=2.5*inch, height=2.5*inch, kind='proportional')
        Story.append(img)
        Story.append(Spacer(1, 0.2*inch))
    else:
        Story.append(Spacer(1, 1*inch))
        
    Story.append(Paragraph("ACTIVIDAD FINAL: PRESENTACIÓN TÉCNICA DEL PROYECTO", styles['TitlePage']))
    
    Story.append(Spacer(1, 0.2*inch))
    
    data = [
        ["Nombre del proyecto:", "ServiLocal"],
        ["Integrantes del grupo:", "1. Yerik Joshua Martínez Guerrero"],
        ["", "2. Jesua Ramírez Chira"],
        ["", "3. Eduardo Antonio Álvarez Álvarez"],
        ["", "4. Santiago Núñez Ramírez"],
        ["Programa de Estudios:", "Desarrollo de Sistemas de Información"],
        ["Unidad Didáctica:", "Prueba de Sistemas Informáticos"],
        ["Docente:", "Omar Burgos Palacios"],
        ["Periodo académico:", "V"]
    ]
    
    t = Table(data, colWidths=[2.5*inch, 3.5*inch])
    t.setStyle(TableStyle([
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        # Add light gray lines for better structure
        ('LINEBELOW', (0,0), (-1,0), 1, colors.HexColor('#e5e7eb')),
        ('LINEBELOW', (0,4), (-1,-1), 1, colors.HexColor('#e5e7eb')),
    ]))
    Story.append(Spacer(1, 0.5*inch))
    Story.append(t)
    Story.append(PageBreak())

    # INDICE
    Story.append(Paragraph("Índice", styles['TOCHeader'])) # Note: using TOCHeader so it doesn't notify TOCEntry
    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(name='TOC0', fontSize=12, fontName='Helvetica-Bold', leftIndent=0, firstLineIndent=0, spaceBefore=8, leading=18),
        ParagraphStyle(name='TOC1', fontSize=12, fontName='Helvetica', leftIndent=20, firstLineIndent=0, spaceBefore=2, leading=18),
    ]
    Story.append(toc)
    Story.append(PageBreak())

    # Helpers
    def header(text):
        if not text.startswith("1. Introdu"):
            Story.append(PageBreak())
        Story.append(Paragraph(text, styles['SectionHeader']))
        
    def subheader(text):
        Story.append(Paragraph(text, styles['SubHeader']))
        
    def text(t):
        Story.append(Paragraph(t, styles['CustomBodyText']))
        
    def bullet(t):
        Story.append(Paragraph("• " + t, styles['CustomBulletText']))

    def add_image_box(caption, image_path=None):
        if image_path and os.path.exists(image_path):
            img = Image(image_path, width=6*inch, height=3.2*inch, kind='proportional')
            Story.append(Spacer(1, 0.2*inch))
            Story.append(img)
        else:
            tbl = Table([["[ Espacio para " + caption.split(':')[0] + " ]"]], colWidths=[6*inch], rowHeights=[3*inch])
            tbl.setStyle(TableStyle([
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('INNERGRID', (0,0), (-1,-1), 1, colors.gray),
                ('BOX', (0,0), (-1,-1), 2, colors.gray),
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f9f9f9')),
                ('TEXTCOLOR', (0,0), (-1,-1), colors.gray),
                ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 14),
            ]))
            Story.append(Spacer(1, 0.2*inch))
            Story.append(tbl)
            
        Story.append(Paragraph(caption, styles['ImageCaption']))

    # CONTENIDO
    Story.append(StartContent())
    header("1. Introducción")
    text("El presente documento detalla la estructura, funcionalidades, arquitectura y resultados de la implementación de la plataforma web ServiLocal, un sistema enfocado en la contratación segura y formalización de servicios técnicos y profesionales en la ciudad de Talara.")
    text("En la era digital actual, la modernización de los servicios locales es una necesidad inminente. ServiLocal nace como una respuesta tecnológica innovadora para cerrar la brecha entre profesionales independientes calificados y ciudadanos que demandan reparaciones y mantenimientos con garantías. Al digitalizar el proceso de búsqueda, cotización y calificación, la plataforma no solo agiliza la contratación, sino que también fomenta la formalización laboral en la región, requiriendo documentación oficial (RUC) para perfilar a los proveedores.")
    text("A lo largo de este informe técnico, se presentará de forma estructurada el análisis del problema originario, los objetivos trazados para la construcción del sistema, y la arquitectura de vanguardia seleccionada para el desarrollo (Next.js, Prisma, Vercel, Supabase). Asimismo, se expondrán las evidencias visuales del despliegue en producción y las conclusiones obtenidas tras las pruebas de calidad, demostrando que ServiLocal cumple estrictamente con los estándares modernos de desarrollo de software.")
    
    header("2. Problema identificado")
    subheader("2.1 Descripción del problema")
    text("En la ciudad de Talara existe un alto índice de informalidad y falta de confianza al momento de contratar servicios técnicos para el hogar o empresas, lo que genera inseguridad, pérdida de tiempo y trabajos de baja calidad sin garantía real.")
    
    subheader("2.2 Contexto")
    text("Actualmente, la búsqueda de técnicos se suele realizar mediante recomendaciones de boca a boca o publicaciones informales en redes sociales. Esto deja a los clientes vulnerables frente a estafas o deficiencias técnicas, mientras que los técnicos competentes tienen dificultades para demostrar su profesionalismo.")
    
    subheader("2.3 Usuarios involucrados")
    bullet("Clientes: Personas naturales o empresas locales (como PetroPerú) que requieren soluciones confiables para reparaciones o mantenimientos.")
    bullet("Proveedores: Técnicos y profesionales locales calificados que buscan formalizar sus servicios, emitir comprobantes (RUC) y conseguir más clientes mediante una reputación digital verificada.")
    
    subheader("2.4 Necesidad que se buscó solucionar")
    text("Crear una plataforma centralizada y segura que conecte a clientes de Talara con profesionales locales verificados, estableciendo un sistema de reputación basado en reseñas reales, historial de trabajo y confianza mutua.")

    header("3. Objetivos")
    subheader("3.1 Objetivo general")
    text("Desarrollar e implementar la plataforma web 'ServiLocal' para facilitar la contratación segura de servicios técnicos y profesionales en la ciudad de Talara, mejorando la confianza entre clientes y proveedores.")
    subheader("3.2 Objetivos específicos")
    bullet("Implementar un sistema de registro, validación y verificación de identidad/RUC para proveedores.")
    bullet("Desarrollar un catálogo de servicios categorizado con información de precios referenciales.")
    bullet("Crear un flujo de solicitudes de servicio directo que incluya presupuestos y chat integrado.")
    bullet("Implementar un sistema de calificaciones y reseñas post-servicio que alimente el ranking local.")

    header("4. Tecnologías utilizadas")
    bullet("<b>Frontend:</b> Next.js (React), Tailwind CSS, Lucide React (Iconografía fluida).")
    bullet("<b>Backend:</b> Next.js API Routes (Node.js en modelo serverless).")
    bullet("<b>Base de datos:</b> PostgreSQL (Base de datos relacional).")
    bullet("<b>Framework ORM:</b> Prisma ORM para modelado de datos y migraciones.")
    bullet("<b>Hosting e Infraestructura:</b> Vercel (Frontend & Backend Edge), Supabase (PostgreSQLaaS administrado en AWS).")
    bullet("<b>Seguridad:</b> bcrypt/argon2 para hash de contraseñas, react-hook-form y zod para validación estricta de entradas.")

    header("5. Arquitectura del sistema")
    text("El sistema ha sido construido bajo una arquitectura Cliente-Servidor (Full-stack Serverless) haciendo uso de Next.js. Las cargas de trabajo computacional se ejecutan en Vercel de manera global, mientras la persistencia transaccional recae sobre Supabase.")
    add_image_box("Figura 1: Diagrama de arquitectura del sistema ServiLocal (Cliente -> Vercel -> Supabase).", "guias_sistema/figura_1.png")
    subheader("5.1 Componentes principales")
    bullet("Cliente Web: Interfaz de usuario responsiva SSR (Server-Side Rendered) y CSR (Client-Side Rendered).")
    bullet("API Serverless: Funciones backend dinámicas aisladas que escalan bajo demanda.")
    bullet("Capa de Datos: Prisma Client gestionando migraciones y pool de conexiones seguro hacia la base de datos.")

    header("6. Base de datos")
    text("La estructura de la base de datos asegura integridad referencial estricta y permite escalar perfiles, servicios y reseñas eficientemente sin duplicación de información.")
    add_image_box("Figura 2: Diagrama Entidad-Relación generado a partir del esquema lógico Prisma.", "guias_sistema/figura_2.png")
    subheader("6.1 Tablas principales")
    bullet("User: Almacena credenciales seguras, roles (CLIENT, ADMIN, PROVIDER) y estado de verificación.")
    bullet("ProviderProfile: Información especializada del negocio, RUC, disponibilidad y especialidad matriz.")
    bullet("Service: Catálogo de servicios publicados, con tiempos estimados y tarifas base.")
    bullet("ServiceRequest: Trazabilidad de solicitudes de trabajo, negociación y estados de aceptación.")
    bullet("Review: Sistema de puntaje de 1 a 5 estrellas y comentarios descriptivos post-servicio.")

    header("7. Funcionalidades implementadas")
    subheader("7.1 Inicio de sesión y Autenticación")
    add_image_box("Figura 3: Pantalla de autenticación segura para clientes y proveedores.", "guias_sistema/figura_3.png")
    
    subheader("7.2 Registro de usuarios y validación")
    add_image_box("Figura 4: Formulario de registro con validación estricta de datos.", "guias_sistema/figura_4.png")
    
    subheader("7.3 Catálogo de Servicios")
    add_image_box("Figura 5: Exploración de servicios filtrados por categorías y búsqueda dinámica.", "guias_sistema/figura_5.png")

    subheader("7.4 Panel Administrativo (Dashboard)")
    text("El panel de administración permite al equipo del sistema llevar un monitoreo en tiempo real de los proveedores registrados, verificando sus RUCs y aprobando su ingreso al ecosistema.")
    add_image_box("Figura 6: Panel de administración mostrando estadísticas y gestión de usuarios.", "guias_sistema/figura_6.png")

    header("8. Pruebas realizadas")
    bullet("<b>Pruebas funcionales:</b> Se validó la correcta ingesta de datos en los formularios de registro, validación de login y publicación exitosa de servicios al catálogo.")
    bullet("<b>Pruebas de integración:</b> Comprobación de comunicación entre Vercel Edge y Supabase (utilizando puertos TLS 6543/5432) en operaciones CRUD.")
    bullet("<b>Pruebas de seguridad:</b> Verificación de Control de acceso basado en roles (RBAC). Las rutas protegidas como el Panel de Control redirigen correctamente a la página de login si no se presenta un token de sesión JWT válido.")
    bullet("<b>Pruebas UI/UX:</b> Corrección y aseguramiento de responsividad en dispositivos móviles y estabilización visual de componentes críticos como el modal de reseñas.")
    add_image_box("Figura 7: Evidencia de pruebas de despliegue y validación de componentes ejecutadas correctamente.", "guias_sistema/figura_7.png")

    header("9. Despliegue del sistema")
    text("El sistema fue puesto en producción cumpliendo estrictas normativas de Integración y Despliegue Continuo (CI/CD), asegurando actualizaciones sin caída del servicio ante cambios confirmados en la rama principal.")
    bullet("<b>URL oficial del sistema:</b> https://servi-local2026-web.vercel.app/")
    add_image_box("Figura 8: Evidencia del sistema ServiLocal ejecutándose perfectamente en el entorno de Producción.", "guias_sistema/figura_8.png")

    header("10. Resultados obtenidos")
    bullet("Modernización del sector: ServiLocal marca un hito en la ciudad de Talara al ser una solución digital unificada que centraliza la oferta y la demanda técnica.")
    bullet("Reducción de tiempos: Una interfaz amigable ha reducido drásticamente el tiempo requerido para encontrar a un profesional confiable.")
    bullet("Mitigación de riesgos: Se fomenta la formalización al exigir RUC a los técnicos para acceder a la plataforma como proveedor, aumentando la seguridad ciudadana y la confianza al abrir las puertas de un hogar a un profesional.")
    bullet("Experiencia de usuario: Transiciones instantáneas, soporte móvil optimizado (Mobile-First) y una estructura gráfica de fácil entendimiento logran que personas de todas las edades puedan usar el sistema sin dificultad.")

    header("11. Conclusiones")
    text("1. La selección del stack tecnológico basado en Next.js, Vercel y Supabase demostró ser una solución cloud nativa extremadamente veloz y costo-eficiente, ideal para soportar el crecimiento proyectado en la región.")
    text("2. El exhaustivo modelamiento de datos relacional (mediante Prisma ORM) garantizó que no ocurran cuellos de botella durante las solicitudes de servicio en tiempo real ni al ejecutar búsquedas en el catálogo.")
    text("3. El proyecto ServiLocal no solo cumple con los requisitos técnicos exigidos en la prueba de sistemas, sino que se perfila como un factor transformador y de gran impacto socio-económico en Talara, al impulsar la formalidad y dar visibilidad al buen profesional.")

    header("12. Recomendaciones")
    text("1. Implementar en fases posteriores una pasarela de pagos integrada (como Niubiz, MercadoPago o Culqi) para permitir cobros por tarjeta directamente en la plataforma, reteniendo las comisiones de forma automatizada.")
    text("2. Desarrollar una App Nativa complementaria (utilizando React Native o Flutter) dedicada exclusivamente al perfil Proveedor, para que reciban alertas Push inmediatas ante una nueva solicitud de trabajo.")
    text("3. Establecer alianzas estratégicas con la Municipalidad Provincial de Talara o empresas grandes del sector industrial para certificar a técnicos recomendados en la plataforma, aumentando así su alcance corporativo.")

    doc.multiBuild(Story, canvasmaker=NumberedCanvas)
    print("PDF profesional con índice y capturas completas generado exitosamente.")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self.is_content = False
        self.content_start_page = None
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            # Decorative double border for the cover page
            self.setStrokeColor(colors.HexColor('#1e40af'))
            self.setLineWidth(2)
            self.rect(30, 30, A4[0]-60, A4[1]-60)
            
            self.setStrokeColor(colors.HexColor('#2563eb'))
            self.setLineWidth(1)
            self.rect(34, 34, A4[0]-68, A4[1]-68)
        elif getattr(self, 'is_content', False):
            self.setFont("Helvetica", 9)
            # Calculate content page number (excluding Cover and any TOC pages)
            start_page = getattr(self, 'content_start_page', None)
            if not start_page:
                start_page = self._pageNumber
            content_page = self._pageNumber - start_page + 1
            total_content = page_count - start_page + 1
            self.drawRightString(A4[0] - 72, 30, f"Página {content_page} de {total_content}")

if __name__ == "__main__":
    create_pdf()
