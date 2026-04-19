export async function executarModeloPython(imagemPath, modelPath) {
  console.log(`Rodando o modelo ${modelPath} em ${imagemPath}`);
  return; //TODO: serviço em python
  
  try {
    const res = await fetch("http://localhost:8000/infer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imagem: imagemPath,
        model: modelPath,
      }),
    });

    if (!res.ok) {
      throw new Error(`Erro HTTP ${res.status}`);
    }

    return await res.json();

  } catch (err) {
    console.error("Erro ao executar modelo Python:", err);
    throw err; // importante pra teu controle de tentativas
  }
}