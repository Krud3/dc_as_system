/** 19 principios de la Teoría General de Sistemas aplicados al Data Center. */
export const PRINCIPIOS_TGS = [
  {
    n: 1,
    nombre: 'Frontera',
    aplicacion:
      'Define qué elementos hacen parte del Data Center y cuáles no pertenecen.',
    ejemplo:
      'Los servidores, racks, UPS, sistemas de refrigeración y equipos de red hacen parte del Data Center, mientras que la red eléctrica externa y las condiciones climáticas pertenecen al entorno.',
  },
  {
    n: 2,
    nombre: 'Entorno (Ambiente)',
    aplicacion:
      'Elementos externos afectan el funcionamiento del Data Center.',
    ejemplo:
      'Un rayo cae cerca del Data Center y provoca una falla en el sistema eléctrico, mostrando cómo un evento del entorno puede alterar el funcionamiento del sistema.',
  },
  {
    n: 3,
    nombre: 'Totalidad',
    aplicacion:
      'El Data Center funciona como un conjunto de componentes relacionados que trabajan para cumplir una función en común.',
    ejemplo:
      'La disponibilidad del Data Center no depende únicamente de los servidores, sino de la interacción entre servidores, almacenamiento, red, energía y refrigeración. Una falla en uno de estos componentes puede afectar el funcionamiento del conjunto.',
  },
  {
    n: 4,
    nombre: 'Equifinalidad',
    aplicacion:
      'El Data Center puede alcanzar el objetivo de mantener disponible un servicio crítico partiendo de diferentes condiciones o utilizando diferentes mecanismos de operación.',
    ejemplo:
      'Ante una falla del servidor principal, el servicio puede continuar mediante un servidor redundante; ante una falla del almacenamiento, puede recuperarse mediante una réplica de los datos; y ante una falla grave del Data Center, puede utilizarse un sitio alterno. En los diferentes casos se busca llegar al mismo resultado: mantener disponible el servicio.',
  },
  {
    n: 5,
    nombre: 'Jerarquía',
    aplicacion:
      'El Data Center está organizado en diferentes niveles y componentes que forman parte de la estructura general.',
    ejemplo:
      'Nivel 0: microprocesador → Nivel 1: servidor → Nivel 2: rack → Nivel 3: sala blanca → Nivel 4: Data Center.',
  },
  {
    n: 6,
    nombre: 'Complejidad',
    aplicacion:
      'El Data Center está formado por muchos elementos y relaciones que funcionan de manera coordinada.',
    ejemplo:
      'En la maqueta 3D se incorporan progresivamente servidores, switches, almacenamiento, sistemas de energía, refrigeración y monitoreo, mostrando las diferentes conexiones e interacciones entre estos componentes. A medida que aumentan los elementos y sus relaciones, se evidencia la complejidad del sistema.',
  },
  {
    n: 7,
    nombre: 'Sinergia',
    aplicacion:
      'Los componentes del Data Center trabajan conjuntamente para producir un funcionamiento que no podría obtenerse si cada elemento trabajara de manera independiente.',
    ejemplo:
      'La interacción entre servidores, almacenamiento, red, energía y refrigeración permite prestar servicios informáticos de manera continua. Cada componente por separado no puede proporcionar el servicio completo del Data Center.',
  },
  {
    n: 8,
    nombre: 'Emergencia',
    aplicacion:
      'La emergencia se refiere a algo que aparece como resultado de la interacción de diferentes elementos del sistema.',
    ejemplo:
      'En la maqueta, la emergencia se representa con humo que aparece dentro del Data Center y se acumula hasta formar una nube sobre el sistema. Esa condición no estaba al inicio: surge de la interacción de los componentes.',
  },
  {
    n: 9,
    nombre: 'Resiliencia',
    aplicacion:
      'Después de una perturbación o falla, el sistema logra mantener o recuperar su funcionamiento.',
    ejemplo:
      'Ante un corte de la red pública de energía, los sistemas de respaldo como los generadores arrancan y estabilizan la frecuencia en menos de 15 segundos.',
  },
  {
    n: 10,
    nombre: 'Adaptabilidad',
    aplicacion:
      'El Data Center modifica sus mecanismos de protección ante cambios en sus condiciones internas o externas.',
    ejemplo:
      'Ante fuertes lluvias que pueden afectar el entorno, el Data Center toma medidas para adaptarse y continuar con su correcto funcionamiento.',
  },
  {
    n: 11,
    nombre: 'Entropía',
    aplicacion:
      'La entropía se manifiesta mediante el deterioro progresivo de los componentes y la pérdida de eficiencia durante el funcionamiento.',
    ejemplo:
      'Sin mantenimiento, el deterioro de servidores, refrigeración y equipos eléctricos puede llegar al punto de dejar de funcionar.',
  },
  {
    n: 12,
    nombre: 'Neguentropía',
    aplicacion:
      'Acciones que combaten el deterioro y mantienen el sistema organizado: mantenimiento, limpieza, actualización y monitoreo.',
    ejemplo:
      'Las actividades de mantenimiento, limpieza, actualización y monitoreo aportan recursos y trabajo al sistema para contrarrestar su deterioro y mantenerlo organizado y funcionando.',
  },
  {
    n: 13,
    nombre: 'Homeóstasis',
    aplicacion:
      'El Data Center busca mantener condiciones adecuadas y estables para su funcionamiento.',
    ejemplo:
      'El aumento de temperatura y la respuesta del sistema de refrigeración mantienen condiciones adecuadas dentro del Data Center.',
  },
  {
    n: 14,
    nombre: 'Equilibrio',
    aplicacion:
      'Distribución adecuada de recursos y condiciones: carga de trabajo, energía, refrigeración y capacidad deben mantenerse balanceados.',
    ejemplo:
      'El Data Center distribuye la carga de procesamiento entre diferentes servidores para evitar la sobrecarga de un equipo y mantener estable el funcionamiento general del sistema.',
  },
  {
    n: 15,
    nombre: 'Retroalimentación',
    aplicacion:
      'La información sobre el funcionamiento del sistema permite realizar ajustes y mantener su correcto desempeño.',
    ejemplo:
      'La temperatura sube, el sensor la mide y envía la señal al control; el NOC aumenta la refrigeración, la temperatura baja y el sensor vuelve a medir. Ese lazo se repite de forma continua.',
  },
  {
    n: 16,
    nombre: 'Estructura',
    aplicacion:
      'Configuración y disposición de los componentes de forma relacionada de acuerdo con las funciones del sistema.',
    ejemplo:
      'El Data Center solo puede operar si sus componentes están dispuestos y conectados de forma correcta: los racks se organizan en filas, dentro de cada uno se ubican servidores y switches, la red y la energía los alimentan, y la refrigeración circula por los pasillos. Esa distribución y esas relaciones forman la estructura del sistema; sin ella, las mismas piezas no lograrían sostener el servicio.',
  },
  {
    n: 17,
    nombre: 'Recursividad',
    aplicacion:
      'El Data Center está compuesto por subsistemas que, a su vez, están formados por elementos organizados.',
    ejemplo:
      'Al acercarnos al Data Center encontramos un rack; dentro del rack, un servidor; dentro del servidor, procesador, memoria y almacenamiento; y dentro del procesador, nuevas partes. En cada nivel se repite la misma idea: un sistema que forma parte de otro y, a la vez, está compuesto por subsistemas.',
  },
  {
    n: 18,
    nombre: 'Complementariedad',
    aplicacion:
      'El Data Center depende de otros sistemas y servicios externos para cumplir adecuadamente su función.',
    ejemplo:
      'El centro de datos es inoperable si se desconecta del sistema interconectado de energía eléctrica, el suministro de agua y las redes de comunicación.',
  },
  {
    n: 19,
    nombre: 'Multicausalidad',
    aplicacion:
      'El funcionamiento del Data Center puede verse afectado por diferentes causas que actúan de manera conjunta.',
    ejemplo:
      'Un aumento de temperatura en el Data Center ocurre por la combinación de diferentes causas: ola de calor exterior + fallo en el CRAC + aumento de demanda de datos.',
  },
]
