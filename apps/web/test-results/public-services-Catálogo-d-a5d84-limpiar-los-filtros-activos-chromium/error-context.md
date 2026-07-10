# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public\services.spec.ts >> Catálogo de Servicios >> debe poder limpiar los filtros activos
- Location: e2e\public\services.spec.ts:63:7

# Error details

```
Error: expect(received).not.toContain(expected) // indexOf

Expected substring: not "categoryId"
Received string:        "http://localhost:3000/servicios?categoryId=cmpx4vazu0000h0lii2dq8d66"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - link "ServiLocal" [ref=e6] [cursor=pointer]:
          - /url: /
          - img [ref=e8]
          - generic [ref=e10]: ServiLocal
        - navigation [ref=e11]:
          - link "Servicios" [ref=e12] [cursor=pointer]:
            - /url: /servicios
          - link "Proveedores" [ref=e13] [cursor=pointer]:
            - /url: /proveedores
          - link "Sobre nosotros" [ref=e14] [cursor=pointer]:
            - /url: /sobre-nosotros
          - link "Ayuda" [ref=e15] [cursor=pointer]:
            - /url: /ayuda
          - button "Toggle theme" [ref=e17]:
            - img [ref=e18]
          - link "Ingresar" [ref=e20] [cursor=pointer]:
            - /url: /iniciar-sesion
          - link "Registrarse" [ref=e21] [cursor=pointer]:
            - /url: /registrarse
    - main [ref=e22]:
      - generic [ref=e24]:
        - generic [ref=e25]:
          - img [ref=e26]
          - text: Catálogo de servicios
        - heading "Encuentra el servicio que necesitas hoy" [level=1] [ref=e30]:
          - text: Encuentra el servicio
          - text: que necesitas hoy
        - paragraph [ref=e31]: Explora el catálogo completo de servicios ofrecidos por proveedores verificados. Compara precios, tiempos estimados y niveles de confianza antes de solicitar.
        - generic [ref=e32]:
          - img [ref=e33]
          - textbox "Buscar servicio, proveedor o categoría..." [ref=e36]
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - img [ref=e42]
            - paragraph [ref=e46]: "152"
            - paragraph [ref=e47]: Servicios disponibles
          - generic [ref=e48]:
            - img [ref=e51]
            - paragraph [ref=e54]: "8"
            - paragraph [ref=e55]: Proveedores verificados
          - generic [ref=e56]:
            - img [ref=e59]
            - paragraph [ref=e61]: S/ 282
            - paragraph [ref=e62]: Precio referencial promedio
        - generic [ref=e63]:
          - generic [ref=e64]:
            - img [ref=e65]
            - generic [ref=e66]: Filtrar por categoría
          - generic [ref=e67]:
            - button "Todas" [ref=e68]:
              - img [ref=e69]
              - text: Todas
            - button "Electricidad 9" [ref=e71]:
              - img [ref=e72]
              - text: Electricidad
              - generic [ref=e74]: "9"
            - button "Plomería 16" [ref=e75]:
              - img [ref=e76]
              - text: Plomería
              - generic [ref=e79]: "16"
            - button "Limpieza 17" [ref=e80]:
              - img [ref=e81]
              - text: Limpieza
              - generic [ref=e84]: "17"
            - button "Carpintería 18" [ref=e85]:
              - img [ref=e86]
              - text: Carpintería
              - generic [ref=e90]: "18"
            - button "Pintura 11" [ref=e91]:
              - img [ref=e92]
              - text: Pintura
              - generic [ref=e96]: "11"
            - button "Jardinería 14" [ref=e97]:
              - img [ref=e98]
              - text: Jardinería
              - generic [ref=e101]: "14"
            - button "Cerrajería 13" [ref=e102]:
              - img [ref=e103]
              - text: Cerrajería
              - generic [ref=e106]: "13"
            - button "Aire acondicionado 12" [ref=e107]:
              - img [ref=e108]
              - text: Aire acondicionado
              - generic [ref=e112]: "12"
            - button "Albañilería 15" [ref=e113]:
              - img [ref=e114]
              - text: Albañilería
              - generic [ref=e116]: "15"
            - button "Mudanzas 10" [ref=e117]:
              - img [ref=e118]
              - text: Mudanzas
              - generic [ref=e120]: "10"
            - button "Tecnología 8" [ref=e121]:
              - img [ref=e122]
              - text: Tecnología
              - generic [ref=e124]: "8"
            - button "Otro servicio 9" [ref=e125]:
              - img [ref=e126]
              - text: Otro servicio
              - generic [ref=e128]: "9"
        - paragraph [ref=e130]: 152 servicios encontrados · Página 1 de 13
        - generic [ref=e131]:
          - article [ref=e132] [cursor=pointer]:
            - generic [ref=e133]:
              - generic [ref=e134]:
                - generic [ref=e135]:
                  - img [ref=e136]
                  - text: Albañilería
                - generic [ref=e138]:
                  - img [ref=e139]
                  - text: Verificado
              - heading "Construcción de muros" [level=2] [ref=e141]
              - paragraph [ref=e142]: Construcción de muros divisorios, cercos perimétricos y tabiques en ladrillo, bloqueta o drywall.
              - generic [ref=e143]:
                - generic [ref=e144]:
                  - img [ref=e146]
                  - generic [ref=e148]: S/ 740.00
                  - generic [ref=e149]: referencial
                - generic [ref=e150]:
                  - img [ref=e152]
                  - generic [ref=e155]: 3 días
            - link "S Servicios Martínez EIRL Punta Arenas ✓ Verificado" [ref=e158]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - generic [ref=e159]: S
              - generic [ref=e160]:
                - paragraph [ref=e161]: Servicios Martínez EIRL
                - paragraph [ref=e162]: Punta Arenas
              - generic [ref=e163]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e165]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - text: Ver proveedor y solicitar
              - img [ref=e166]
          - article [ref=e168] [cursor=pointer]:
            - generic [ref=e169]:
              - generic [ref=e170]:
                - generic [ref=e171]:
                  - img [ref=e172]
                  - text: Albañilería
                - generic [ref=e174]:
                  - img [ref=e175]
                  - text: Verificado
              - heading "Reparación de fisuras y grietas" [level=2] [ref=e177]
              - paragraph [ref=e178]: Tratamiento profesional de fisuras en paredes y techos con materiales especializados para evitar filtraciones.
              - generic [ref=e179]:
                - generic [ref=e180]:
                  - img [ref=e182]
                  - generic [ref=e184]: S/ 200.00
                  - generic [ref=e185]: referencial
                - generic [ref=e186]:
                  - img [ref=e188]
                  - generic [ref=e191]: Medio día
            - link "S Servicios Martínez EIRL Punta Arenas ✓ Verificado" [ref=e194]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - generic [ref=e195]: S
              - generic [ref=e196]:
                - paragraph [ref=e197]: Servicios Martínez EIRL
                - paragraph [ref=e198]: Punta Arenas
              - generic [ref=e199]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e201]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - text: Ver proveedor y solicitar
              - img [ref=e202]
          - article [ref=e204] [cursor=pointer]:
            - generic [ref=e205]:
              - generic [ref=e206]:
                - generic [ref=e207]:
                  - img [ref=e208]
                  - text: Albañilería
                - generic [ref=e210]:
                  - img [ref=e211]
                  - text: Verificado
              - heading "Revestimiento de pisos y paredes" [level=2] [ref=e213]
              - paragraph [ref=e214]: Instalación de cerámicos, porcelanato, mayólica y piedra natural con acabados de primera calidad.
              - generic [ref=e215]:
                - generic [ref=e216]:
                  - img [ref=e218]
                  - generic [ref=e220]: S/ 190.00
                  - generic [ref=e221]: referencial
                - generic [ref=e222]:
                  - img [ref=e224]
                  - generic [ref=e227]: 1 día
            - link "S Servicios Martínez EIRL Punta Arenas ✓ Verificado" [ref=e230]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - generic [ref=e231]: S
              - generic [ref=e232]:
                - paragraph [ref=e233]: Servicios Martínez EIRL
                - paragraph [ref=e234]: Punta Arenas
              - generic [ref=e235]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e237]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - text: Ver proveedor y solicitar
              - img [ref=e238]
          - article [ref=e240] [cursor=pointer]:
            - generic [ref=e241]:
              - generic [ref=e242]:
                - generic [ref=e243]:
                  - img [ref=e244]
                  - text: Albañilería
                - generic [ref=e246]:
                  - img [ref=e247]
                  - text: Verificado
              - heading "Albañilería general" [level=2] [ref=e249]
              - paragraph [ref=e250]: "Trabajos de albañilería: levantamiento de muros, tarrajeo, asentado de ladrillos y acabados en concreto."
              - generic [ref=e251]:
                - generic [ref=e252]:
                  - img [ref=e254]
                  - generic [ref=e256]: S/ 270.00
                  - generic [ref=e257]: referencial
                - generic [ref=e258]:
                  - img [ref=e260]
                  - generic [ref=e263]: 1 día
            - link "S Servicios Martínez EIRL Punta Arenas ✓ Verificado" [ref=e266]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - generic [ref=e267]: S
              - generic [ref=e268]:
                - paragraph [ref=e269]: Servicios Martínez EIRL
                - paragraph [ref=e270]: Punta Arenas
              - generic [ref=e271]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e273]:
              - /url: /proveedores/cmpx4vd4d001fh0lis9l5ms2v
              - text: Ver proveedor y solicitar
              - img [ref=e274]
          - article [ref=e276] [cursor=pointer]:
            - generic [ref=e277]:
              - generic [ref=e278]:
                - generic [ref=e279]:
                  - img [ref=e280]
                  - text: Aire acondicionado
                - generic [ref=e284]:
                  - img [ref=e285]
                  - text: Verificado
              - heading "Instalación de aire acondicionado" [level=2] [ref=e287]
              - paragraph [ref=e288]: Instalación profesional de equipos split, ventana o cassette con canalización de tuberías y cableado eléctrico.
              - generic [ref=e289]:
                - generic [ref=e290]:
                  - img [ref=e292]
                  - generic [ref=e294]: S/ 590.00
                  - generic [ref=e295]: referencial
                - generic [ref=e296]:
                  - img [ref=e298]
                  - generic [ref=e301]: Medio día
            - link "S Servicios Moreno EIRL Lobitos ✓ Verificado" [ref=e304]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - generic [ref=e305]: S
              - generic [ref=e306]:
                - paragraph [ref=e307]: Servicios Moreno EIRL
                - paragraph [ref=e308]: Lobitos
              - generic [ref=e309]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e311]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - text: Ver proveedor y solicitar
              - img [ref=e312]
          - article [ref=e314] [cursor=pointer]:
            - generic [ref=e315]:
              - generic [ref=e316]:
                - generic [ref=e317]:
                  - img [ref=e318]
                  - text: Aire acondicionado
                - generic [ref=e322]:
                  - img [ref=e323]
                  - text: Verificado
              - heading "Mantenimiento de aire acondicionado" [level=2] [ref=e325]
              - paragraph [ref=e326]: Limpieza completa de filtros, serpentines, drenaje y verificación de gas refrigerante para óptimo rendimiento.
              - generic [ref=e327]:
                - generic [ref=e328]:
                  - img [ref=e330]
                  - generic [ref=e332]: S/ 120.00
                  - generic [ref=e333]: referencial
                - generic [ref=e334]:
                  - img [ref=e336]
                  - generic [ref=e339]: 1 hora
            - link "S Servicios Moreno EIRL Lobitos ✓ Verificado" [ref=e342]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - generic [ref=e343]: S
              - generic [ref=e344]:
                - paragraph [ref=e345]: Servicios Moreno EIRL
                - paragraph [ref=e346]: Lobitos
              - generic [ref=e347]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e349]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - text: Ver proveedor y solicitar
              - img [ref=e350]
          - article [ref=e352] [cursor=pointer]:
            - generic [ref=e353]:
              - generic [ref=e354]:
                - generic [ref=e355]:
                  - img [ref=e356]
                  - text: Aire acondicionado
                - generic [ref=e360]:
                  - img [ref=e361]
                  - text: Verificado
              - heading "Recarga de gas refrigerante" [level=2] [ref=e363]
              - paragraph [ref=e364]: Recarga de gas R410A, R22 o R32 con detección previa de fugas para garantizar eficiencia del equipo.
              - generic [ref=e365]:
                - generic [ref=e366]:
                  - img [ref=e368]
                  - generic [ref=e370]: S/ 290.00
                  - generic [ref=e371]: referencial
                - generic [ref=e372]:
                  - img [ref=e374]
                  - generic [ref=e377]: 1 hora
            - link "S Servicios Moreno EIRL Lobitos ✓ Verificado" [ref=e380]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - generic [ref=e381]: S
              - generic [ref=e382]:
                - paragraph [ref=e383]: Servicios Moreno EIRL
                - paragraph [ref=e384]: Lobitos
              - generic [ref=e385]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e387]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - text: Ver proveedor y solicitar
              - img [ref=e388]
          - article [ref=e390] [cursor=pointer]:
            - generic [ref=e391]:
              - generic [ref=e392]:
                - generic [ref=e393]:
                  - img [ref=e394]
                  - text: Aire acondicionado
                - generic [ref=e398]:
                  - img [ref=e399]
                  - text: Verificado
              - heading "Reparación de aire acondicionado" [level=2] [ref=e401]
              - paragraph [ref=e402]: "Diagnóstico y reparación de fallas: compresor, tarjeta electrónica, ventilador y problemas de enfriamiento."
              - generic [ref=e403]:
                - generic [ref=e404]:
                  - img [ref=e406]
                  - generic [ref=e408]: S/ 250.00
                  - generic [ref=e409]: referencial
                - generic [ref=e410]:
                  - img [ref=e412]
                  - generic [ref=e415]: Medio día
            - link "S Servicios Moreno EIRL Lobitos ✓ Verificado" [ref=e418]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - generic [ref=e419]: S
              - generic [ref=e420]:
                - paragraph [ref=e421]: Servicios Moreno EIRL
                - paragraph [ref=e422]: Lobitos
              - generic [ref=e423]: ✓ Verificado
            - link "Ver proveedor y solicitar" [ref=e425]:
              - /url: /proveedores/cmpx4vd3s001dh0likx3fdxqb
              - text: Ver proveedor y solicitar
              - img [ref=e426]
          - article [ref=e428] [cursor=pointer]:
            - generic [ref=e429]:
              - generic [ref=e431]:
                - img [ref=e432]
                - text: Cerrajería
              - heading "Cambio de cerraduras" [level=2] [ref=e435]
              - paragraph [ref=e436]: "Reemplazo de cerraduras de todo tipo: sobreponer, embutir, multipunto. Marcas reconocidas con garantía."
              - generic [ref=e437]:
                - generic [ref=e438]:
                  - img [ref=e440]
                  - generic [ref=e442]: S/ 160.00
                  - generic [ref=e443]: referencial
                - generic [ref=e444]:
                  - img [ref=e446]
                  - generic [ref=e449]: 1 hora
            - link "S Servicios Pérez EIRL El Alto" [ref=e452]:
              - /url: /proveedores/cmpx4vd31001bh0lilwurxdpw
              - generic [ref=e453]: S
              - generic [ref=e454]:
                - paragraph [ref=e455]: Servicios Pérez EIRL
                - paragraph [ref=e456]: El Alto
            - link "Ver proveedor y solicitar" [ref=e458]:
              - /url: /proveedores/cmpx4vd31001bh0lilwurxdpw
              - text: Ver proveedor y solicitar
              - img [ref=e459]
          - article [ref=e461] [cursor=pointer]:
            - generic [ref=e462]:
              - generic [ref=e464]:
                - img [ref=e465]
                - text: Cerrajería
              - heading "Instalación de cerraduras digitales" [level=2] [ref=e468]
              - paragraph [ref=e469]: Instalación de cerraduras inteligentes con código, huella dactilar o app móvil para mayor seguridad.
              - generic [ref=e470]:
                - generic [ref=e471]:
                  - img [ref=e473]
                  - generic [ref=e475]: S/ 330.00
                  - generic [ref=e476]: referencial
                - generic [ref=e477]:
                  - img [ref=e479]
                  - generic [ref=e482]: 2 horas
            - link "S Servicios Pérez EIRL El Alto" [ref=e485]:
              - /url: /proveedores/cmpx4vd31001bh0lilwurxdpw
              - generic [ref=e486]: S
              - generic [ref=e487]:
                - paragraph [ref=e488]: Servicios Pérez EIRL
                - paragraph [ref=e489]: El Alto
            - link "Ver proveedor y solicitar" [ref=e491]:
              - /url: /proveedores/cmpx4vd31001bh0lilwurxdpw
              - text: Ver proveedor y solicitar
              - img [ref=e492]
          - article [ref=e494] [cursor=pointer]:
            - generic [ref=e495]:
              - generic [ref=e497]:
                - img [ref=e498]
                - text: Cerrajería
              - heading "Apertura de cerraduras" [level=2] [ref=e501]
              - paragraph [ref=e502]: Apertura de puertas sin daño con técnicas profesionales. Servicio disponible las 24 horas.
              - generic [ref=e503]:
                - generic [ref=e504]:
                  - img [ref=e506]
                  - generic [ref=e508]: S/ 110.00
                  - generic [ref=e509]: referencial
                - generic [ref=e510]:
                  - img [ref=e512]
                  - generic [ref=e515]: 15-30 min
            - link "S Servicios Pérez EIRL El Alto" [ref=e518]:
              - /url: /proveedores/cmpx4vd31001bh0lilwurxdpw
              - generic [ref=e519]: S
              - generic [ref=e520]:
                - paragraph [ref=e521]: Servicios Pérez EIRL
                - paragraph [ref=e522]: El Alto
            - link "Ver proveedor y solicitar" [ref=e524]:
              - /url: /proveedores/cmpx4vd31001bh0lilwurxdpw
              - text: Ver proveedor y solicitar
              - img [ref=e525]
          - article [ref=e527] [cursor=pointer]:
            - generic [ref=e528]:
              - generic [ref=e530]:
                - img [ref=e531]
                - text: Jardinería
              - heading "Control de plagas en jardín" [level=2] [ref=e534]
              - paragraph [ref=e535]: Fumigación y tratamiento fitosanitario para proteger tus plantas de plagas, hongos y enfermedades.
              - generic [ref=e536]:
                - generic [ref=e537]:
                  - img [ref=e539]
                  - generic [ref=e541]: S/ 130.00
                  - generic [ref=e542]: referencial
                - generic [ref=e543]:
                  - img [ref=e545]
                  - generic [ref=e548]: 2 horas
            - link "S Servicios Martínez EIRL Lobitos" [ref=e551]:
              - /url: /proveedores/cmpx4vd2b0019h0liizzc825q
              - generic [ref=e552]: S
              - generic [ref=e553]:
                - paragraph [ref=e554]: Servicios Martínez EIRL
                - paragraph [ref=e555]: Lobitos
            - link "Ver proveedor y solicitar" [ref=e557]:
              - /url: /proveedores/cmpx4vd2b0019h0liizzc825q
              - text: Ver proveedor y solicitar
              - img [ref=e558]
        - navigation "Paginación" [ref=e560]:
          - button "Anterior" [disabled]:
            - generic:
              - img
            - text: Anterior
          - generic [ref=e561]:
            - button "1" [ref=e562]
            - button "2" [ref=e563]
            - button "3" [ref=e564]
            - button "4" [ref=e565]
            - button "5" [ref=e566]
            - button "6" [ref=e567]
            - button "7" [ref=e568]
          - button "Siguiente" [ref=e569]:
            - img [ref=e571]
            - text: Siguiente
        - generic [ref=e574]:
          - heading "¿Eres proveedor de servicios?" [level=2] [ref=e575]
          - paragraph [ref=e576]: Únete a ServiLocal, publica tus servicios y conecta con clientes de tu zona. Construye tu reputación con nuestra barra de confianza.
          - generic [ref=e577]:
            - link "Registrarme como proveedor" [ref=e578] [cursor=pointer]:
              - /url: /registrarse
              - text: Registrarme como proveedor
              - img [ref=e579]
            - link "Saber más" [ref=e581] [cursor=pointer]:
              - /url: /sobre-nosotros
    - contentinfo [ref=e582]:
      - generic [ref=e584]:
        - generic [ref=e585]:
          - generic [ref=e586]:
            - link "ServiLocal" [ref=e587] [cursor=pointer]:
              - /url: /
              - img [ref=e589]
              - generic [ref=e591]: ServiLocal
            - paragraph [ref=e592]: La plataforma líder para encontrar profesionales de confianza en tu zona. Simplificamos la conexión entre talento local y necesidades del hogar.
            - generic [ref=e593]:
              - link [ref=e594] [cursor=pointer]:
                - /url: "#"
                - img [ref=e595]
              - link [ref=e597] [cursor=pointer]:
                - /url: "#"
                - img [ref=e598]
              - link [ref=e600] [cursor=pointer]:
                - /url: "#"
                - img [ref=e601]
              - link [ref=e603] [cursor=pointer]:
                - /url: "#"
                - img [ref=e604]
          - generic [ref=e606]:
            - heading "Plataforma" [level=3] [ref=e607]
            - list [ref=e608]:
              - listitem [ref=e609]:
                - link "Catálogo de servicios" [ref=e610] [cursor=pointer]:
                  - /url: /servicios
              - listitem [ref=e611]:
                - link "Buscar proveedores" [ref=e612] [cursor=pointer]:
                  - /url: /proveedores
              - listitem [ref=e613]:
                - link "Cómo funciona" [ref=e614] [cursor=pointer]:
                  - /url: /sobre-nosotros
              - listitem [ref=e615]:
                - link "Únete como profesional" [ref=e616] [cursor=pointer]:
                  - /url: /registrarse
              - listitem [ref=e617]:
                - link "Programa de puntos" [ref=e618] [cursor=pointer]:
                  - /url: /panel/cliente/recompensas
          - generic [ref=e619]:
            - heading "Soporte" [level=3] [ref=e620]
            - list [ref=e621]:
              - listitem [ref=e622]:
                - link "→ Centro de ayuda" [ref=e623] [cursor=pointer]:
                  - /url: /ayuda
                  - generic: →
                  - text: Centro de ayuda
              - listitem [ref=e624]:
                - link "→ Preguntas frecuentes" [ref=e625] [cursor=pointer]:
                  - /url: /ayuda
                  - generic: →
                  - text: Preguntas frecuentes
              - listitem [ref=e626]:
                - link "→ Guías de seguridad" [ref=e627] [cursor=pointer]:
                  - /url: /ayuda
                  - generic: →
                  - text: Guías de seguridad
              - listitem [ref=e628]:
                - link "Contacto" [ref=e629] [cursor=pointer]:
                  - /url: mailto:soporte@servilocal.com
                  - img [ref=e630]
                  - text: Contacto
          - generic [ref=e633]:
            - heading "Legal" [level=3] [ref=e634]
            - list [ref=e635]:
              - listitem [ref=e636]:
                - link "Términos de servicio" [ref=e637] [cursor=pointer]:
                  - /url: /terminos
              - listitem [ref=e638]:
                - link "Política de privacidad" [ref=e639] [cursor=pointer]:
                  - /url: /privacidad
              - listitem [ref=e640]:
                - link "Política de cookies" [ref=e641] [cursor=pointer]:
                  - /url: /cookies
              - listitem [ref=e642]:
                - link "Auditoría y confianza" [ref=e643] [cursor=pointer]:
                  - /url: /confianza
        - generic [ref=e644]:
          - paragraph [ref=e646]: © 2026 ServiLocal. Todos los derechos reservados.
          - generic [ref=e648]:
            - text: Hecho con
            - generic [ref=e649]: ❤
            - text: en Perú
  - button "Open Next.js Dev Tools" [ref=e655] [cursor=pointer]:
    - img [ref=e656]
  - alert [ref=e659]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // ─────────────────────────────────────────────────────────────────────────────
  4   | // Suite: Catálogo de Servicios — /servicios
  5   | //
  6   | // Valida la carga del catálogo público, el sistema de filtros por categoría,
  7   | // la búsqueda de texto, los estados vacíos y la navegación a proveedores.
  8   | // ─────────────────────────────────────────────────────────────────────────────
  9   | 
  10  | test.describe('Catálogo de Servicios', () => {
  11  | 
  12  |   test.beforeEach(async ({ page }) => {
  13  |     await page.goto('/servicios');
  14  |     // Esperar a que el hero del catálogo cargue
  15  |     await page.waitForSelector('h1', { state: 'visible', timeout: 15_000 });
  16  |   });
  17  | 
  18  |   // ═══════════════════════════════════════════════════════════════════════════
  19  |   // SECCIÓN 1: Carga inicial
  20  |   // ═══════════════════════════════════════════════════════════════════════════
  21  | 
  22  |   test('debe mostrar el título del catálogo', async ({ page }) => {
  23  |     await expect(page.locator('h1')).toContainText('Encuentra el servicio');
  24  |   });
  25  | 
  26  |   test('debe mostrar la barra de búsqueda del hero', async ({ page }) => {
  27  |     await expect(
  28  |       page.getByPlaceholder('Buscar servicio, proveedor o categoría...')
  29  |     ).toBeVisible();
  30  |   });
  31  | 
  32  |   test('debe mostrar las tarjetas KPI (servicios disponibles, verificados, precio)', async ({ page }) => {
  33  |     // Esperar que la carga termine (las tarjetas KPI se renderizan después del fetch)
  34  |     await page.waitForTimeout(3000);
  35  |     await expect(page.getByText('Servicios disponibles', { exact: true })).toBeVisible();
  36  |     await expect(page.getByText('Proveedores verificados', { exact: true })).toBeVisible();
  37  |     await expect(page.getByText('Precio referencial promedio', { exact: true })).toBeVisible();
  38  |   });
  39  | 
  40  |   // ═══════════════════════════════════════════════════════════════════════════
  41  |   // SECCIÓN 2: Filtros por categoría
  42  |   // ═══════════════════════════════════════════════════════════════════════════
  43  | 
  44  |   test('debe mostrar los chips de filtro de categorías', async ({ page }) => {
  45  |     // Esperar a que los chips aparezcan (se cargan desde la API)
  46  |     await page.waitForTimeout(3000);
  47  |     await expect(page.getByText('Filtrar por categoría')).toBeVisible();
  48  |     // El chip "Todas" siempre debe estar
  49  |     await expect(page.getByRole('button', { name: 'Todas' })).toBeVisible();
  50  |   });
  51  | 
  52  |   test('al hacer clic en una categoría, la URL debe actualizarse con categoryId', async ({ page }) => {
  53  |     await page.waitForTimeout(3000);
  54  |     // Buscar un chip de categoría que no sea "Todas"
  55  |     const chips = page.locator('button:has-text("Electricidad")');
  56  |     if (await chips.count() > 0) {
  57  |       await chips.first().click();
  58  |       await page.waitForTimeout(1000);
  59  |       expect(page.url()).toContain('categoryId');
  60  |     }
  61  |   });
  62  | 
  63  |   test('debe poder limpiar los filtros activos', async ({ page }) => {
  64  |     await page.waitForTimeout(3000);
  65  |     const chips = page.locator('button:has-text("Electricidad")');
  66  |     if (await chips.count() > 0) {
  67  |       await chips.first().click();
  68  |       await page.waitForTimeout(1000);
  69  |       // Buscar el botón "Limpiar"
  70  |       const limpiar = page.getByRole('button', { name: 'Limpiar' });
  71  |       if (await limpiar.isVisible()) {
  72  |         await limpiar.click();
  73  |         await page.waitForTimeout(500);
> 74  |         expect(page.url()).not.toContain('categoryId');
      |                                ^ Error: expect(received).not.toContain(expected) // indexOf
  75  |       }
  76  |     }
  77  |   });
  78  | 
  79  |   // ═══════════════════════════════════════════════════════════════════════════
  80  |   // SECCIÓN 3: Búsqueda
  81  |   // ═══════════════════════════════════════════════════════════════════════════
  82  | 
  83  |   test('al escribir en el buscador, debe actualizar los parámetros de la URL', async ({ page }) => {
  84  |     const searchInput = page.getByPlaceholder('Buscar servicio, proveedor o categoría...');
  85  |     await searchInput.fill('electricidad');
  86  |     // Esperar el debounce (350ms) + algo de margen
  87  |     await page.waitForTimeout(800);
  88  |     expect(page.url()).toContain('search=electricidad');
  89  |   });
  90  | 
  91  |   test('al buscar algo inexistente, debe mostrar estado vacío', async ({ page }) => {
  92  |     const searchInput = page.getByPlaceholder('Buscar servicio, proveedor o categoría...');
  93  |     await searchInput.fill('xyznoexiste999');
  94  |     await page.waitForTimeout(2000);
  95  |     await expect(page.getByText('No se encontraron servicios')).toBeVisible({ timeout: 8000 });
  96  |   });
  97  | 
  98  |   // ═══════════════════════════════════════════════════════════════════════════
  99  |   // SECCIÓN 4: Tarjetas de servicio y navegación
  100 |   // ═══════════════════════════════════════════════════════════════════════════
  101 | 
  102 |   test('debe mostrar al menos una tarjeta de servicio cuando hay datos', async ({ page }) => {
  103 |     // Esperar carga de servicios
  104 |     await page.waitForTimeout(3000);
  105 |     const cards = page.locator('article');
  106 |     const count = await cards.count();
  107 |     expect(count).toBeGreaterThan(0);
  108 |   });
  109 | 
  110 |   test('las tarjetas de servicio deben tener botón "Ver proveedor y solicitar"', async ({ page }) => {
  111 |     await page.waitForTimeout(3000);
  112 |     const ctaButtons = page.getByRole('link', { name: 'Ver proveedor y solicitar' });
  113 |     const count = await ctaButtons.count();
  114 |     expect(count).toBeGreaterThan(0);
  115 |   });
  116 | 
  117 |   // ═══════════════════════════════════════════════════════════════════════════
  118 |   // SECCIÓN 5: CTA inferior
  119 |   // ═══════════════════════════════════════════════════════════════════════════
  120 | 
  121 |   test('debe mostrar el CTA inferior "¿Eres proveedor de servicios?"', async ({ page }) => {
  122 |     await expect(page.getByText('¿Eres proveedor de servicios?').first()).toBeVisible();
  123 |   });
  124 | });
  125 | 
```