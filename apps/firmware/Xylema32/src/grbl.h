// Variáveis de estado do GRBL
enum EstadoGRBL {
    OCIOSO,
    ATIVO,
    PAUSA,
    ALARME,
    PORTA,
    HOMING,
    DESCONHECIDO,
};

EstadoGRBL interpretarEstadoGRBL(String linha) {
  // Verificações diretas usando indexOf
  
  if (linha.indexOf("Idle") != -1)  return OCIOSO;
  if (linha.indexOf("Run") != -1)   return ATIVO;
  if (linha.indexOf("Hold") != -1)  return PAUSA;
  if (linha.indexOf("Alarm") != -1) return ALARME;
  if (linha.indexOf("Door") != -1)  return PORTA;
  if (linha.indexOf("Home") != -1)  return HOMING;

  return DESCONHECIDO; // Default seguro
}

String interpretarPosicaoGRBL(String linhaStatus) {
    if (!linhaStatus.startsWith("<") || !linhaStatus.endsWith(">")) {
        return "{\"erro\":\"linha de status inválida\"}"; // Retorna erro se não for status válido
    }

    String coordenadasStr = "";
    
    // Procura por MPos ou WPos na string de status
    int mposIndex = linhaStatus.indexOf("MPos:");
    int wposIndex = linhaStatus.indexOf("WPos:");
    
    int startIndex = -1;
    if (mposIndex != -1) {
        startIndex = mposIndex + 5; // Tamanho de "MPos:"
    } else if (wposIndex != -1) {
        startIndex = wposIndex + 5; // Tamanho de "WPos:"
    }
    
    // Se não encontrou nenhuma das posições, retorna um JSON vazio ou com erro
    if (startIndex == -1) {
        return "{\"erro\":\"posicao nao encontrada\"}";
    }
    
    // A posição termina onde houver o caractere '|' ou o fechamento '>'
    int endIndex = linhaStatus.indexOf('|', startIndex);
    if (endIndex == -1) {
        endIndex = linhaStatus.indexOf('>', startIndex);
    }
    
    if (endIndex != -1) {
        return coordenadasStr = linhaStatus.substring(startIndex, endIndex);
    } else {
        return "{\"erro\":\"formato invalido\"}";
    }
}

int interpretarBufferGRBL(String linhaStatus) {
  // Garante que é uma linha de status válida
  if (!linhaStatus.startsWith("<") || !linhaStatus.endsWith(">")) {
    return -1; // Retorna erro se não for status válido
  }

  // Procura pela tag "Bf:" dentro da linha de status
  int indiceBf = linhaStatus.indexOf("Bf:");
  if (indiceBf == -1) {
    return -1; // Campo Bf não encontrado (pode estar desativado no $10 do GRBL)
  }

  // Isola a substring a partir de "Bf:"
  String bfSubstring = linhaStatus.substring(indiceBf + 3);
  
  // O formato é Bf:blocos_livres,bytes_livres
  // Vamos pegar apenas a parte antes da primeira vírgula ou fechamento '>'
  int indiceVirgula = bfSubstring.indexOf(',');
  int indiceFim = bfSubstring.indexOf('>');
  
  if (indiceVirgula == -1) {
    return -1;
  }

  String blocosLivresStr = bfSubstring.substring(0, indiceVirgula);
  blocosLivresStr.trim();

  int blocosLivres = blocosLivresStr.toInt();
  
  return blocosLivres;
}
String interpretarEndstopGRBL(String linhaStatus) {
  if (!linhaStatus.startsWith("<") || !linhaStatus.endsWith(">")) {
    return "";
  }

  int indicePn = linhaStatus.indexOf("Pn:");
  if (indicePn == -1) {
    return ""; // Campo Pn ausente
  }

  // Pega tudo a partir de "Pn:"
  String pnSubstring = linhaStatus.substring(indicePn + 3);
  
  // Encontra onde o campo termina ('|' ou '>')
  int indiceFim = pnSubstring.indexOf('|');
  int indiceFechamento = pnSubstring.indexOf('>');
  
  int fim = pnSubstring.length();
  if (indiceFim != -1 && indiceFim < fim) fim = indiceFim;
  if (indiceFechamento != -1 && indiceFechamento < fim) fim = indiceFechamento;

  // Retorna exatamente o miolo recortado (ex: "XYZ", "X", "P", etc.)
  return pnSubstring.substring(0, fim);
}

void pulsoGRBL(int pin, unsigned long tempoPulsoMs = 100, unsigned long tempoDelayMs = 500) {
    digitalWrite(pin, LOW);
    delay(tempoPulsoMs);
    digitalWrite(pin, HIGH);
    delay(tempoDelayMs);
}

String parseAlarmGRBL(int codigoAlarme) {
  switch (codigoAlarme) {
    case 0: return "No alarm, Likely occurs when your controller is first powered on. If this alarm persists after clearing you may need to seek advice from your controller vendor. ";
    case 1: return "Limite físico atingido. Verifique o robô e reinicie para fazer o homing.";
    case 2: return "G-code excede os limites de movimentação da máquina. Reiniciando.";
    case 3: return "Reset durante o movimento. Reiniciando.";
    case 4: return "Probe fail. The probe is not in the expected initial state before starting probe cycle, where G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered.";
    case 5: return "Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4.";
    case 6: return "Reset durante o ciclo de homing. Reiniciando.";
    case 7: return "Homing fail. Safety door was opened during active homing cycle.";
    case 8: return "Homing fail. Cycle failed to clear limit switch when pulling off. Try increasing pull-off setting or check wiring.";
    case 9: return "Falha no homing: não achou o endstop após 1.5 * max_travel (seek) ou 5 * pulloff (locate).";
    case 10: return "Spindle control failed or system used to control spindle reported an error. This typically could be RS485 errors reported from your controller. Suggest using 0-10V signals instead if this occurs regularly.";
    default: return "Alarme desconhecido do GRBL.";
  }
}


/*
error:0: "No error - Possible crash dump of your controller. Please seek advice from your controller vendor."
error:1: "G-code words consist of a letter and a value. Letter was not found."
error:2: "Numeric value format is not valid or missing an expected value."
error:3: "Machine ‘$’ system command was not recognized or supported."
error:4: "Negative value received for an expected positive value."
error:5: "Homing cycle is not enabled via settings."
error:6: "Minimum step pulse time must be greater than 3usec"
error:7: "EEPROM read failed. Reset and restored to default values."
error:8: "Machine ‘$’ command cannot be used unless Machine is IDLE. Ensures smooth operation during a job."
error:9: "G-code locked out during alarm or jog state"
error:10: "Soft limits cannot be enabled without homing also enabled."
error:11: "Max characters per line exceeded. Line was not processed and executed."
error:12: "‘$’ setting value exceeds the maximum step rate supported."
error:13: "Safety door detected as opened and door state initiated."
error:14: "(Machine-Mega Only) Build info or start up line exceeded EEPROM line length limit.: 
error:15: "Jog target exceeds machine travel. Command ignored."
error:16: "Jog command with no ‘=’ or contains prohibited g-code."
error:17: "Laser mode requires PWM output. Your controller may not be suited to running this firmware or no pin is assigned to regulate laser power."
error:18: "No homing cycle defined in settings, check peripherals tab to ensure you have at least one axis homing."
error:20: "Unsupported or invalid g-code command found in block."
error:21: "More than one g-code command from same modal group found in block."
error:22: "Feed rate has not yet been set or is undefined."
error:23: "G-code command in block requires an integer value."
error:24: "Two G-code commands that both require the use of the XYZ axis words were detected in the block."
error:25: "A G-code word was repeated in the block."
error:26: "A G-code command implicitly or explicitly requires XYZ axis words in the block, but none were detected."
error:27: "N line number value is not within the valid range of 1 – 9,999,999."
error:28: "A G-code command was sent, but is missing some required P or L value words in the line."
error:29: "Machine supports six work coordinate systems G54-G59. G59.1, G59.2, and G59.3 are not supported."
error:30: "The G53 G-code command requires either a G0 seek or G1 feed motion mode to be active. A different motion was active."
error:31: "There are unused axis words in the block and G80 motion mode cancel is active."
error:32: "A G2 or G3 arc was commanded but there are no XYZ axis words in the selected plane to trace the arc."
error:33: "The motion command has an invalid target. G2, G3, and G38.2 generates this error, if the arc is impossible to generate or if the probe target is the current position."
error:34: "A G2 or G3 arc, traced with the radius definition, had a mathematical error when computing the arc geometry. Try either breaking up the arc into semi-circles or quadrants, or redefine them with the arc offset definition."
error:35: "A G2 or G3 arc, traced with the offset definition, is missing the IJK offset word in the selected plane to trace the arc."
error:36: "There are unused, leftover G-code words that aren’t used by any command in the block."
error:37: "The G43.1 dynamic tool length offset command cannot apply an offset to an axis other than its configured axis. The Machine default axis is the Z-axis."
error:38: "An invalid tool number sent to the parser"
error:39: "P parameter value is too large. P values are generally in seconds not milliseconds. Please adjust to a lower number."
error:60: "SD card failed to initialize, Card is likely not inserted OR try ejecting and re-inserting your SD card."
error:61: "SD card failed to read, the most common cause is special characters in your filename, please remove any non-letters or numbers. If this fails, try deleting and replacing your file or formatting your SD card."
error:62: "SD card failed to open directory, the most common causes are: Controller has just connected to Commander, SD card not being inserted or special characters in your filename, please remove any non-letters or numbers. If this fails, try deleting and replacing your folder or formatting your SD card."
error:63: "SD card directory not found. Likely the folder doesn't exist, check your SD card."
error:64: "SD card file empty, you likely have uploaded a blank file by mistake. Please recompile your job and re-upload."
error:65: "SD card file not found.  Likely the file doesn't exist, check your SD card."
error:66: "SD card failed to open. Likely the SD card may need to be formatted. Please ensure to make any back ups before formatting!"
error:67: "SD card is busy. Likely the SD is doing something else right now. Please try again shortly or remove and re-insert your SD card."
error:68: "SD failed to delete directory. Please try to delete the folder using your desktop PC."
error:69: "SD failed to delete file. Please try to delete the file using your desktop PC."
error:70: "Bluetooth failed to start. Try power-cycling your controller or seek advice from your controller vendor."
error:71: "Wifi failed to start. Try power-cycling your controller or seek advice from your controller vendor."
error:80: "Number is out of range for setting. Likely the setting you are trying to change does not exist."
error:81: "Invalid value for setting, The value entered is either not in the right range or may not be the right value i.e: Letter entered when it must a number."
error:90: "Failed to send message, seek advice from your controller vendor."
error:100: "Failed to store setting, seek advice from your controller vendor."
error:101: "Failed to get setting status, seek advice from your controller vendor."
error:110: "Authentication failed. You may have a password required to access your controller."
error:120: "Another interface is busy, Close out of any WebUI windows or wait until they finish uploading your job file before proceeding."
*/