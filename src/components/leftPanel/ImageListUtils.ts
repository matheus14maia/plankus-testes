export const getImagesFromCSV = async (coordinates: string) => {
  try {
    const response = await fetch(coordinates);
    const text = await response.text();

    const rows = text.split("\n").map((row) => row.split("\t"));

    // 🔹 Identificar corretamente os índices das colunas
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const nameIndex = headers.indexOf("file");
    const timestampIndex = headers.indexOf("time");
    const xIndex = headers.indexOf("long");
    const yIndex = headers.indexOf("lat");
    const zIndex = headers.indexOf("alt");
    const courseIndex = headers.indexOf("course");
    const pitchIndex = headers.indexOf("pitch");
    const rollIndex = headers.indexOf("roll");

    if (
      xIndex === -1 || yIndex === -1 || zIndex === -1 || nameIndex === -1
      || courseIndex === -1 || pitchIndex === -1 || rollIndex === -1
    ) {
      console.error("❌ Erro: Cabeçalhos de coluna incorretos no CSV. Verifique os nomes das colunas.");
      console.error("🔍 Cabeçalhos encontrados:", headers);
      return [];
    }

    return rows.slice(1).map((row) => ({
      name: row[nameIndex]?.trim().replace("./", "").replace("\"", "").replace(".JPG\"", ""),
      timestamp: row[timestampIndex]?.trim(),
      x: Number(row[xIndex]?.trim()),
      y: Number(row[yIndex]?.trim()),
      z: Number(row[zIndex]?.trim()),
      course: Number(row[courseIndex]?.trim()),
      pitch: Number(row[pitchIndex]?.trim()),
      roll: Number(row[rollIndex]?.trim()),
    }));
  } catch (error) {
    console.error("❌ Erro ao carregar CSV:", error);
    return [];
  }
};
