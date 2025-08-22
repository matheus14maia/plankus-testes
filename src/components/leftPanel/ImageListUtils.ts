export const getImagesFromCSV = async (csv_url: string) => {
  try {
    const response = await fetch(csv_url);
    const text = await response.text();

    const rows = text.split("\n").map((row) => row.split(","));

    // 🔹 Identificar corretamente os índices das colunas
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const nameIndex = headers.indexOf("name");
    const xIndex = headers.indexOf("pose.translation.x");
    const yIndex = headers.indexOf("pose.translation.y");
    const zIndex = headers.indexOf("pose.translation.z");

    if (xIndex === -1 || yIndex === -1 || zIndex === -1 || nameIndex === -1) {
      console.error("❌ Erro: Cabeçalhos de coluna incorretos no CSV. Verifique os nomes das colunas.");
      console.error("🔍 Cabeçalhos encontrados:", headers);
      return [];
    }

    return rows.slice(1).map((row) => ({
      name: row[nameIndex]?.trim(),
      x: Number(row[xIndex]?.trim()),
      y: Number(row[yIndex]?.trim()),
      z: Number(row[zIndex]?.trim()),
    }));
  } catch (error) {
    console.error("❌ Erro ao carregar CSV:", error);
    return [];
  }
};
