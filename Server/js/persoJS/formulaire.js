/**
 * Created by alexa on 28/03/2017.
 */
var hidden = false;
function action() {
    hidden = !hidden;
    if(hidden) {
        document.getElementById('togglee').style.display='none';
        document.getElementById('toggler').value = 'Show information';
    } else {
        document.getElementById('togglee').style.display='initial';
        document.getElementById('toggler').value = 'Hide information';
    }
}
var masque_info = true;
document.getElementById('modif_info').style.display='none';
function modif_info() {
    masque_info = !masque_info;
    if(masque_info) {
        document.getElementById('modif_info').style.display='none';
    } else {
        document.getElementById('modif_info').style.display='initial';
    }
}
var masque_mdp = true;
document.getElementById('modif_mdp').style.display='none';
function modif_mdp() {
    masque_mdp = !masque_mdp;
    if(masque_mdp) {
        document.getElementById('modif_mdp').style.display='none';
    } else {
        document.getElementById('modif_mdp').style.display='initial';
    }
}

// Fonction de désactivation de l'affichage des "tooltips"
function deactivateTooltips() {
    var tooltips = document.querySelectorAll('.erreur_info'),
        tooltipsLength = tooltips.length;
    for (var i = 0; i < tooltipsLength; i++) {
        tooltips[i].style.display = 'none';
    }
}

function getTooltip(elements) {
    while (elements = elements.nextSibling) {
        if (elements.className === 'erreur_info alert-danger') {
            return elements;
        }
    }
    return false;
}


// Fonctions de vérification du formulaire, elles renvoient "true" si tout est ok

var check_1 = {}; // On met toutes nos fonctions dans un objet littéral
check_1['change_nom'] = function(id) {
    var name = document.getElementById(id),
        tooltipStyle = getTooltip(name).style;
    if (name.value.length >= 2) {
        name.classList.add("correct");
        name.classList.remove("incorrect");
        tooltipStyle.display = 'none';
        return true;
    } else {
        name.classList.add("incorrect");
        name.classList.remove("correct");
        tooltipStyle.display = 'inline-block';
        return false;
    }

};

check_1['change_prenom'] = check_1['change_nom']; // La fonction pour le prénom est la même que celle du nom

var check_2 = {};
check_2['password'] = function() {
    var pwd1 = document.getElementById('password'),
        tooltipStyle = getTooltip(pwd1).style;
    if (pwd1.value.length >= 6) {
        pwd1.classList.add("correct");
        pwd1.classList.remove("incorrect");
        tooltipStyle.display = 'none';
        return true;
    } else {
        pwd1.classList.add("incorrect");
        pwd1.classList.remove("correct");
        tooltipStyle.display = 'inline-block';
        return false;
    }
};

check_2['password2'] = function() {

    var pwd1 = document.getElementById('password'),
        pwd2 = document.getElementById('password2'),
        tooltipStyle = getTooltip(pwd2).style;
    if (pwd1.value == pwd2.value && pwd2.value != '') {
        pwd2.classList.add("correct");
        pwd2.classList.remove("incorrect");
        tooltipStyle.display = 'none';
        return true;
    } else {
        pwd1.classList.add("correct");
        pwd2.classList.remove("incorrect");
        tooltipStyle.display = 'inline-block';
        return false;
    }

};

// Mise en place des événements
(function() { // Utilisation d'une IIFE pour éviter les variables globales.

    var myForm = document.getElementById('modif_info'),
        inputs = document.querySelectorAll('input[type=text]'),
        inputsLength = inputs.length;
    for (var i = 0; i < inputsLength; i++) {
        inputs[i].addEventListener('keyup', function(e) {
            check_1[e.target.id](e.target.id); // "e.target" représente l'input actuellement modifié
        });
    }

    myForm.addEventListener('submit', function(e) {
        var result = true;
        for (var i in check_1) {
            result = check_1[i](i) && result;
        }
        if (result) {
            document.getElementById('modif_info').submit();
        }
        e.preventDefault();
    });


    var myForm2 = document.getElementById('modif_mdp'),
        inputs = document.querySelectorAll('input[type=password]'),
        inputsLength = inputs.length;
    for (var i = 0; i < inputsLength; i++) {
        inputs[i].addEventListener('keyup', function(e) {
            check_2[e.target.id](e.target.id); // "e.target" représente l'input actuellement modifié
        });
    }

    myForm2.addEventListener('submit', function(e) {
        var result = true;
        for (var i in check_2) {
            result = check_2[i](i) && result;
        }
        if (result) {
            document.getElementById('modif_mdp').submit();
        }
        e.preventDefault();
    });


})();

// Maintenant que tout est initialisé, on peut désactiver les "tooltips"
deactivateTooltips();