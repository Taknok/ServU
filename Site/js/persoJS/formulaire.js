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