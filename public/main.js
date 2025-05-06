// On attend que la page soit chargée pour démarrer le jeu
window.addEventListener('DOMContentLoaded', () => {
    // On récupère le canvas
    window.canvas = document.getElementById("canvas");

    // On vérifie que le canvas existe
    if (!window.canvas) {
        alert("Erreur : le canvas n'a pas été trouvé !");
        return;
    }

    // On lance la fonction load() qui initialise le jeu
    if (typeof load === "function") {
        load();
    } else {
        alert("Erreur : la fonction load() n'est pas définie !");
    }
});

// RUN
init();