# Projet_S8

## App
### Build & Debug
#### Prérequis
- Activer le mode developpeur : [link](http://www.frandroid.com/android/developpement/184906_comment-acceder-au-mode-developpeur-sur-android)
- Activer adb et le mettre dans le path : [link](http://lifehacker.com/the-easiest-way-to-install-androids-adb-and-fastboot-to-1586992378)
- Faire un `npm install` dans le dossier `app/`
### Build l'app
Il existe plusieurs methodes, il faut choisir selon le materiel a disposition et selon ce que vous voulez faire. Vous voulez : [link](#Projet_S8)

| Objectif        |  Requis         | Link  |
| ------------- |:-------------:| :-----:|
|  modifications apparaissent directement sur le téléphone (live-debug)      | point wifi (cable USB optionnel) | [link](#1.-Live-Debug) |
| installer l'app     | wifi ou USB      |   [link](#2.-Installer-App) |
| installer l'app | pas wifi ni USB      |    [link](#3.-Installer-Sans-Lien) |

#### 1. Live Debug
- Ouvrir une console dans le dossier `app/`
- Si vous etes connecté en usb : 
```
adb devices
```
- Si vous etes en wifi :
[link](http://stackoverflow.com/questions/2604727/how-can-i-connect-to-android-with-adb-over-tcp#answer-3623727)
- Puis faites :
```
ionic run android -lsc
```
L'application ne fonctionnera que temps que cette commande est en exécution, si vous voulez fonctionner hors ligne il faudra installer l'app a la fin.

#### 2. Installer App
- Ouvrir une console dans le dossier `app/`
- Si vous etes connecté en usb : 
```
adb devices
```
- Si vous etes en wifi :
[link](http://stackoverflow.com/questions/2604727/how-can-i-connect-to-android-with-adb-over-tcp#answer-3623727)
- Puis faites :
```
ionic run android
```

#### 2. Installer Sans Lien
- Ouvrir une console dans le dossier `app/`
- Effectuer :
```
ionic build android
```
- Recupérez le fichier `.apk` dans le dossier `app/platforms/android/build/outputs/apk/` et touvez un moyen de le mettre sur le tel (sans usb ni wifi ... XD) et cliquez sur le fichier apk depuis le tel (avec un explorateur de fichier par exemple)
