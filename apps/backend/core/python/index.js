export async function executarModeloPython(imagemPath, modelPath) {
  console.log(`[executarModeloPython] Rodando o modelo ${modelPath} em ${imagemPath}`);
  //return; //TODO: serviço em python
  
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

    // Erro no HTTP
    if (!res.ok) {
      throw new Error(`[executarModeloPython] Erro HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data

  } catch (err) {
    console.error("[executarModeloPython] Erro ao executar modelo Python:", err);
    throw err; // importante pra teu controle de tentativas
  }
}

export async function gerarRelatorioPython(args) {
  try {
    const result = await fetch("http://localhost:8000/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });

    // Erro no HTTP
    if (!result.ok) {
      throw new Error(`[gerarRelatorioPython] Erro HTTP ${result.status}`);
    }

    const data = await result.json();

    // Erro de execução
    if (data.error) {
      throw new Error(data.error);
    }

    return data

  } catch (err) {
    console.error("[gerarRelatorioPython] Erro ao executar script Python:", err);
    throw err;
  }
}