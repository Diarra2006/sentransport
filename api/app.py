import json
from flask import Flask, jsonify
from flask import request
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

# Charger les donnees depuis le fichier JSON
with open("lignes_ddd.json", "r") as f:
    lignes = json.load(f)

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport!",
        "endpoints": ["/lignes", "/lignes/<id>"]
    })

@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next(
        (l for l in lignes if l["id"] == ligne_id),
        None
    )
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvee"}), 404
    return jsonify(ligne)

@app.route("/arrets")
def get_arrets():
    tous_les_arrets = set()
    
    for ligne in lignes:
        for arret in ligne.get("listeArrets", []):
            tous_les_arrets.add(arret)
            
    # Convertir le set en liste triée (optionnel, mais plus propre) et retourner en JSON
    return jsonify(list(tous_les_arrets))

@app.route("/stats")
def get_stats():
    # 1. Nombre total de lignes
    nb_lignes = len(lignes)
    
    # Initialisation des variables pour le calcul
    total_arrets = 0
    ligne_max_arrets = None
    max_arrets = -1

    for ligne in lignes:
        # Récupérer le nombre d'arrêts de la ligne actuelle
        # On utilise len(..., []) par sécurité si 'listeArrets' est manquante
        nb_arrets_ligne = len(ligne.get("listeArrets", []))
        
        # 2. On cumule pour le total global
        total_arrets += nb_arrets_ligne
        
        # 3. On cherche la ligne avec le plus d'arrêts
        if nb_arrets_ligne > max_arrets:
            max_arrets = nb_arrets_ligne
            ligne_max_arrets = ligne.get("numero") # On récupère son numéro

    # Retourner le résultat structuré en JSON
    return jsonify({
        "nombre_total_lignes": nb_lignes,
        "nombre_total_arrets": total_arrets,
        "ligne_avec_le_plus_d_arrets": ligne_max_arrets
    })
    
@app.route("/lignes/recherche")
def rechercher_lignes():
    # 1. Récupérer le paramètre 'q' dans l'URL. Si 'q' n'est pas fourni, sa valeur par défaut sera ""
    requete = request.args.get("q", "")
    
    # Mettre en minuscules pour rendre la recherche insensible à la casse (ex: "pikine" ou "Pikine")
    requete_minuscule = requete.lower()
    
    # 2. Filtrer les lignes
    lignes_filtrees = []
    for ligne in lignes:
        depart = ligne.get("depart", "").lower()
        arrivee = ligne.get("arrivee", "").lower()
        
        # Vérifier si le mot recherché est dans le départ ou l'arrivée
        if requete_minuscule in depart or requete_minuscule in arrivee:
            lignes_filtrees.append(ligne)
            
    # 3. Retourner la liste des lignes correspondantes en JSON
    return jsonify(lignes_filtrees)

if __name__ == "__main__":
    app.run(debug=True, port=5000)