import fs from "fs";
import path from "path";

function formatTimestamp(date: Date): string {
  return date.toISOString();
}

function formatFilenameTimestamp(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function generateFundingRFC(
  currentSats: number,
  thresholdSats: number,
  address: string
): string {
  const now = new Date();
  const timestamp = formatTimestamp(now);
  const filenameTimestamp = formatFilenameTimestamp(now);
  const draftsDir = path.resolve(__dirname, "../drafts");
  const outputPath = path.join(draftsDir, `rfc-${filenameTimestamp}.md`);

  const markdown = `# RFC - Recarga de Tesorería Operativa

**Timestamp:** ${timestamp}
**Clasificacion:** Cyber-Institutional / Funding Response
**Origen:** Teyolia Agent (A2)

## Estado Actual

Se ha detectado una caída en las reservas operativas (Balance actual: ${currentSats} sats. Umbral crítico: ${thresholdSats} sats).

La telemetria de tesoreria confirma que el balance liquido de la direccion operativa ha ingresado en zona de riesgo. Se recomienda activar una recarga coordinada para preservar continuidad de operaciones, cobertura de costos y capacidad de respuesta del sistema.

## Llamado a la Accion

Los operadores humanos A0 deben evaluar esta alerta y, si procede, enviar fondos a la tesoreria operativa en la siguiente direccion:

\`${address}\`

### Protocolo Sugerido

1. Verificar el balance reportado por Teyolia contra la fuente de Chronik.
2. Definir el monto de recarga necesario para superar el umbral critico y restaurar margen operativo.
3. Ejecutar el fondeo hacia la direccion de tesoreria indicada.
4. Registrar la decision, el monto enviado y la referencia de la transaccion para trazabilidad institucional.

## Nota Operativa

Esta minuta ha sido generada automaticamente para acelerar la coordinacion entre agentes humanos y la capa operativa de Tonalli. No constituye ejecucion automatica de fondos: solo una solicitud formal de intervencion y recarga.

## Firma

**Teyolia Agent (A2)**  
Funding & Operations Agent  
Civilizacion Tonalli
`;

  fs.mkdirSync(draftsDir, { recursive: true });
  fs.writeFileSync(outputPath, markdown, "utf8");

  return outputPath;
}
