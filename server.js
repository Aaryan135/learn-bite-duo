import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Docker from 'dockerode';
import tarStream from 'tar-stream';

const docker = new Docker();
const app = express();
const PORT = 5050;

app.use(cors());
app.use(bodyParser.json());

const LANGUAGE_CONFIG = {
  javascript: {
    image: 'node:20-alpine',
    cmd: (filename) => ['node', filename],
    ext: '.js',
  },
  python: {
    image: 'python:3.11-alpine',
    cmd: (filename) => ['python', filename],
    ext: '.py',
  },
};

app.post('/execute-code', async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language || !LANGUAGE_CONFIG[language]) {
    return res.status(400).json({ error: 'Invalid code or language' });
  }

  const config = LANGUAGE_CONFIG[language];
  const filename = `Main${config.ext}`;

  try {
    const container = await docker.createContainer({
      Image: config.image,
      Cmd: config.cmd(filename),
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      HostConfig: {
        AutoRemove: true,
        Memory: 128 * 1024 * 1024,
        NetworkMode: 'none',
      },
    });

    const tar = tarStream.pack();
    tar.entry({ name: filename }, code);
    tar.finalize();

    await container.putArchive(tar, { path: '/' });
    await container.start();

    const stream = await container.attach({ stream: true, stdout: true, stderr: true });
    let output = '';
    stream.on('data', (chunk) => {
      output += chunk.toString();
    });

    await container.wait();
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
