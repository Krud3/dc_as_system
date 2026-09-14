/** 19 principios de la Teoría General de Sistemas aplicados al Data Center. */
export const PRINCIPIOS_TGS = [
  {
    n: 1,
    nombre: 'Frontera',
    aplicacion:
      'Define qué elementos hacen parte del Data Center y cuáles no pertenecen.',
    ejemplo:
      'Los servidores, racks, UPS, refrigeración y sistemas de red están dentro del Data Center, junto con delimitadores físicos como rejas; la red eléctrica externa pertenece al entorno.',
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
      'Se recorren los elementos principales del Data Center —servidores, switches, almacenamiento, energía, refrigeración, sala NOC y seguridad— y al final todos quedan resaltados juntos, mostrando que el sistema se entiende como un todo.',
  },
  {
    n: 4,
    nombre: 'Equifinalidad',
    aplicacion:
      'El sistema puede utilizar diferentes medios o caminos para alcanzar un mismo objetivo.',
    ejemplo:
      'El Data Center busca mantener disponible un servicio crítico y puede lograrlo mediante diferentes alternativas: redundancia de servidores, replicación de datos o activación de un sitio alterno en caso de una falla.',
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
      'Observamos diferentes elementos funcionando al mismo tiempo —servidores, cables, refrigeración, energía y redes— mostrando las relaciones que existen dentro del sistema.',
  },
  {
    n: 7,
    nombre: 'Sinergia',
    aplicacion:
      'Los componentes del Data Center trabajan conjuntamente para producir un funcionamiento que no podría obtenerse si cada elemento trabajara de manera independiente.',
    ejemplo:
      'La combinación de diferentes servicios operando logra el completo funcionamiento del Data Center.',
  },
  {
    n: 8,
    nombre: 'Emergencia',
    aplicacion:
      'El funcionamiento en conjunto de los elementos produce características que no tienen cada componente de manera separada.',
    ejemplo:
      'Cuando los servidores, la red, la energía y la refrigeración interactúan como un conjunto, surge una propiedad que ninguno de ellos tiene por separado: el servicio en la nube. Ese servicio llega a la ciudad y solo existe en el sistema completo, no en un componente aislado.',
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
      'Después de mantenimiento, limpieza y actualización de equipos, el Data Center recupera su funcionamiento y mejora sus condiciones de operación.',
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
      'Cuando un servidor recibe demasiadas solicitudes, el sistema reparte parte de la carga hacia otros servidores hasta equilibrarla.',
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
