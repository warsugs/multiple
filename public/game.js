let score = 0;
let questions = [];
let questionIndex = 0;
let gameReady = false;
let timerMs = 30000; // 30 000 ms = 30 secondes
let timerInterval = null;
let mauvaisesReponses = 0;
let tempsTotalMs = 0;
let debutPartie = 0;
let pourcentageReussite = Math.round((score / 100) * 100);

// Tables autorisées
const tables = [5, 8, 11, 17, 35];

function formatTemps(ms) {
    let minutes = Math.floor(ms / 60000);
    let secondes = Math.floor((ms % 60000) / 1000);
    let millisecondes = ms % 1000;
    let minStr = minutes.toString().padStart(2, '0');
    let secStr = secondes.toString().padStart(2, '0');
    let msStr = millisecondes.toString().padStart(3, '0');
    return `${minStr}:${secStr}:${msStr}`;
}

// Générer toutes les combinaisons possibles, puis les mélanger
function genererQuestions() {
    questions = [];
    for (let t of tables) {
        for (let i = 1; i <= 20; i++) {
            questions.push({ a: t, b: i });
        }
    }
    // Mélange aléatoire
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    questionIndex = 0;
}

function nouvelleQuestion() {
    if (questionIndex >= questions.length) {
        finDePartie("Bravo, tu as terminé toutes les questions !");
        return;
    }
    afficherQuestion();
}

function afficherQuestion() {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    if (questionIndex < questions.length) {
        let q = questions[questionIndex];
        ctx.fillText(`Combien font : ${q.a} × ${q.b} ?`, canvas.width / 2, canvas.height / 2);
    }
    ctx.fillText(`Score : ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText(`Temps restant : ${formatTemps(timerMs)}`, canvas.width / 2, 40);

    // Affichage de la saisie courante
    ctx.font = "20px Arial";
    ctx.fillStyle = "blue";
    ctx.fillText(`Votre réponse : ${window.saisie || ""}`, canvas.width / 2, canvas.height / 2 + 80);
}

function verifierReponse(reponse) {
    if (questionIndex >= questions.length) return;
    let q = questions[questionIndex];
    if (parseInt(reponse) === q.a * q.b) {
        score++;
        timerMs += 3000; // +3 secondes = +3000 ms
    } else {
        mauvaisesReponses++;
    }
    // Que la réponse soit bonne ou non, on passe à la question suivante
    questionIndex++;
    nouvelleQuestion();
}

function finDePartie(message) {
    clearInterval(timerInterval);
    tempsTotalMs = Date.now() - debutPartie;
    let pourcentageReussite = Math.round((score / 100) * 100);
    let nom = prompt(`${message}\nPourcentage de réussite : ${pourcentageReussite}%\nTemps total : ${formatTemps(tempsTotalMs)}\nEntre ton nom pour le classement :`);
    if (nom) {
        envoyerScoreEtRecommencer(nom, pourcentageReussite, tempsTotalMs);
    } else {
        recommencerJeu();
    }
}

function envoyerScoreEtRecommencer(nom, pourcentageReussite, tempsTotalMs) {
    fetch('https://multiple-0by1.onrender.com/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nom,
            pourcentageReussite,
            tempsTotalMs
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Score envoyé !");
        afficherClassement();
        recommencerJeu();
    })
    .catch(error => {
        alert("Erreur lors de l'envoi du score");
        console.error(error);
        recommencerJeu();
    });
}

function recommencerJeu() {
    score = 0;
    timerMs = 30000;
    window.saisie = "";
    genererQuestions();
    afficherQuestion();
    debutPartie = Date.now();
    demarrerTimer();
    mauvaisesReponses = 0;
    tempsTotalMs = 0;
}

function afficherClassement() {
    fetch('https://multiple-0by1.onrender.com/classement')
        .then(response => response.json())
        .then(scores => {
            let classement = "Classement général :\n";
            classement += "Nom | % Réussite | Temps total\n";
            classement += "--------------------------------------\n";
            scores.forEach((entry, index) => {
                classement += `${index + 1}. ${entry.nom} | ${entry.pourcentageReussite || 0}% | ${formatTemps(entry.tempsTotalMs || 0)}\n`;
            });
            alert(classement);
        })
        .catch(error => {
            alert("Erreur lors de la récupération du classement");
            console.error(error);
        });
}

// Gestion des entrées clavier
document.addEventListener("keydown", function(e) {
    if (!gameReady) return;
    if (!window.saisie) window.saisie = "";
    if (e.key >= "0" && e.key <= "9") {
        window.saisie += e.key;
        afficherQuestion();
    }
    if (e.key === "Backspace") {
        window.saisie = window.saisie.slice(0, -1);
        afficherQuestion();
    }
    if (e.key === "Enter") {
        verifierReponse(window.saisie);
        window.saisie = "";
        afficherQuestion();
    }
});

function afficherSaisie() {
    afficherQuestion();
}

// Timer en millisecondes
function demarrerTimer() {
    clearInterval(timerInterval);
    let derniereMaj = Date.now();
    timerInterval = setInterval(() => {
        let maintenant = Date.now();
        let ecoule = maintenant - derniereMaj;
        derniereMaj = maintenant;
        timerMs -= ecoule;
        if (timerMs < 0) timerMs = 0;
        afficherQuestion();
        if (timerMs <= 0) {
            finDePartie("Temps écoulé !");
        }
    }, 50); // actualisation fluide
}

// Initialisation du jeu
function load() {
    gameReady = true;
    recommencerJeu();
}

// Les fonctions update et draw ne sont plus nécessaires ici, mais tu peux les laisser vides si besoin
function update(dt) {}
function draw(ctx) {}

function validerReponseMobile() {
    const input = document.getElementById('reponse');
    if (input) {
        verifierReponse(input.value);
        input.value = "";
        input.focus();
    }
}

