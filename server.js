const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Pour lire les données envoyées en JSON
app.use(express.json());
app.use(express.static('public'));

// Fichier où seront stockés les scores
const SCORES_FILE = 'scores.json';

// Fonction pour lire les scores depuis le fichier
function readScores() {
    if (!fs.existsSync(SCORES_FILE)) return [];
    const data = fs.readFileSync(SCORES_FILE);
    return JSON.parse(data);
}

// Fonction pour écrire les scores dans le fichier
function writeScores(scores) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

// Route pour recevoir un score
app.post('/score', (req, res) => {
    const { nom, pourcentageReussite, tempsTotalMs } = req.body;
    if (!nom || typeof pourcentageReussite !== 'number' || typeof tempsTotalMs !== 'number') {
        return res.status(400).json({ message: 'Données manquantes' });
    }
    let scores = readScores();
    scores.push({ nom, pourcentageReussite, tempsTotalMs });
    // Classement : d'abord par % réussite, puis par temps total croissant (plus rapide d'abord)
    scores.sort((a, b) => {
        if (b.pourcentageReussite !== a.pourcentageReussite) {
            return b.pourcentageReussite - a.pourcentageReussite;
        }
        return a.tempsTotalMs - b.tempsTotalMs;
    });
    writeScores(scores);
    res.json({ message: 'Score enregistré' });
});

// Route pour obtenir le classement général
app.get('/classement', (req, res) => {
    const scores = readScores();
    res.json(scores);
});

// Route pour réinitialiser le classement
app.post('/reset-scores', (req, res) => {
    const fs = require('fs');
    fs.writeFileSync('score.json', '[]');
    res.json({ message: 'Classement réinitialisé !' });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
