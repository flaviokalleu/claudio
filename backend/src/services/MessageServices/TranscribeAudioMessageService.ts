import fs from 'fs';
import path from 'path';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';

type Response = { transcribedText: string } | string;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('Chave da API Gemini não encontrada no .env. Defina GEMINI_API_KEY.');
}

const TranscribeAudioMessageToText = async (fileName: string, companyId: number): Promise<Response> => {
  const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");
  const companyFolder = `${publicFolder}/company${companyId}`;

  // Garantir que o diretório company${companyId} exista
  if (!fs.existsSync(companyFolder)) {
    try {
      fs.mkdirSync(companyFolder, { recursive: true });
    } catch (error) {
      console.error(`Erro ao criar diretório ${companyFolder}:`, error);
      return 'Erro ao criar diretório para o arquivo';
    }
  }

  const inputFilePath = `${companyFolder}/${fileName}`;

  if (!fs.existsSync(inputFilePath)) {
    console.error(`Arquivo não encontrado: ${inputFilePath}`);
    return 'Arquivo não encontrado';
  }

  try {
    // Passo 1: Ler o arquivo de áudio original e converter para base64
    const audioBuffer = fs.readFileSync(inputFilePath);
    const base64Audio = audioBuffer.toString('base64');

    // Passo 2: Determinar o tipo MIME com base na extensão do arquivo
    const fileExtension = path.extname(fileName).toLowerCase();
    let mimeType: string;

    switch (fileExtension) {
      case '.mp3':
        mimeType = 'audio/mp3';
        break;
      case '.wav':
        mimeType = 'audio/wav';
        break;
      case '.ogg':
        mimeType = 'audio/ogg';
        break;
      case '.m4a':
        mimeType = 'audio/mp4';
        break;
      default:
        console.warn(`Formato de arquivo não suportado explicitamente: ${fileExtension}. Tentando como audio/mp3.`);
        mimeType = 'audio/mp3'; // Padrão, mas pode falhar se o formato não for compatível
    }

    // Passo 3: Construir o corpo da requisição JSON para o Gemini
    const requestData = {
      contents: [
        {
          parts: [
            { text: 'Transcreva o conteúdo deste áudio para texto em português.' },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    };

    // Passo 4: Enviar a requisição para o Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Passo 5: Extrair a transcrição da resposta
    const transcription = response.data.candidates[0].content.parts[0].text;

    return { transcribedText: transcription };
  } catch (error) {
    console.error('Erro ao transcrever o áudio:', error);
    return 'Conversão pra texto falhou';
  }
};

export default TranscribeAudioMessageToText;